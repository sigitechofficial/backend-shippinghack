require("dotenv").config();
// Unified sign-in for the combined Admin + Warehouse panel.
//
// All four roles live in the single `warehouses` table, keyed by classifiedAId:
//   1 = Admin (owner)          -> panelType "admin",     isOwner true
//   2 = Admin employee         -> panelType "admin",     isOwner false
//   3 = Warehouse (owner)      -> panelType "warehouse", isOwner true
//   5 = Warehouse employee     -> panelType "warehouse", isOwner false
//
// This endpoint is ADDITIVE: the existing `admin/signin` and `warehouse/signin`
// stay untouched (the mobile/customer/website apps depend on them). It returns
// one normalized identity and issues the panel-correct token so the existing
// checkPermission / checkwarehousePermission middleware keep working unchanged.

const { warehouse, classifiedAs, feature, permission } = require("../models");
const CustomException = require("../middleware/errorObject");
const bcrypt = require("bcryptjs");
const { sign } = require("jsonwebtoken");
const redis_Client = require("../routes/redis_connect");
const { returnFunction } = require("../utils/helperFuncCompany");

const PERMISSION_TYPES = ["create", "read", "update", "delete"];

// Build the [{featureId,title,key,featureOf,perms:{create,read,update,delete}}]
// matrix for an employee's role. Mirrors getPermissions() in admin/warehouse.
function buildPermissionMatrix(features, permissionData) {
  return features.map((f) => {
    const forFeature = permissionData.filter((p) => p.featureId === f.id);
    const perms = PERMISSION_TYPES.reduce(
      (acc, type) => ({
        ...acc,
        [type]: forFeature.some((p) => p.permissionType === type),
      }),
      {}
    );
    return {
      featureId: f.id,
      title: f.title,
      key: f.key,
      featureOf: f.featureOf,
      perms,
    };
  });
}

async function signIn(req, res) {
  const { email, password, dvToken } = req.body;

  const userData = await warehouse.findOne({
    where: { email, status: true, classifiedAId: [1, 2, 3, 5] },
    include: [{ model: classifiedAs }],
  });

  if (!userData) {
    throw new CustomException("User not found", "Please enter valid data");
  }

  const match = await bcrypt.compare(password, userData.password);
  if (!match) {
    throw new CustomException(
      "Bad credentials",
      "Please enter the correct password to continue"
    );
  }

  const classifiedAId = userData.classifiedAId;
  const panelType =
    classifiedAId === 1 || classifiedAId === 2 ? "admin" : "warehouse";
  const isOwner = classifiedAId === 1 || classifiedAId === 3;

  // Warehouse owners with an incomplete profile follow the same branch as
  // warehouse/signin so onboarding is not regressed.
  if (panelType === "warehouse" && isOwner && !userData.phoneNum) {
    return res.json(
      returnFunction(
        "2",
        "Login Failed Company Info incomplete",
        { id: userData.id, email: userData.email },
        ""
      )
    );
  }

  await warehouse.update({ dvToken }, { where: { id: userData.id } });

  // All active features (id/title for the token, plus key/featureOf for the
  // client to group nav and drive routing).
  const features = await feature.findAll({
    where: { status: true },
    attributes: ["id", "title", "key", "featureOf"],
  });

  let permissionMatrix = [];
  if (!isOwner && userData.roleId) {
    const permissionData = await permission.findAll({
      where: { roleId: userData.roleId },
      attributes: ["featureId", "permissionType"],
    });
    permissionMatrix = buildPermissionMatrix(features, permissionData);
  }

  // Token shape must match what each panel's middleware expects:
  //  - admin middleware (checkPermission) reads req.user.featureData
  //  - warehouse middleware (checkwarehousePermission) does not
  const payload =
    panelType === "admin"
      ? {
          id: userData.id,
          email: userData.email,
          dvToken,
          featureData: features.map((f) => ({ id: f.id, title: f.title })),
        }
      : { id: userData.id, email: userData.email, dvToken };

  const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET);
  redis_Client.hSet(`tsh${userData.id}`, dvToken, accessToken);

  const output = {
    id: userData.id,
    email: userData.email,
    name: userData.companyName,
    classifiedAId,
    roleId: userData.roleId || null,
    isOwner,
    panelType,
    region: userData.located || null,
    adminType: userData.classifiedA ? userData.classifiedA.name : null,
    featureData: features,
    permissionMatrix,
    accessToken,
  };

  return res.json(returnFunction("1", "Login Successful", output, ""));
}

module.exports = { signIn };
