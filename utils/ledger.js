// Money ledger helpers (wallet + paymentRequests).
//
// wallet rows per booking: "User Paid" (+ what the customer paid), driver earnings
// (− what the driver is owed) and one "Admin Earning" = −(sum of the others), so a
// booking's rows sum to zero and the business share is −(Admin Earning).
//
// Driver payouts live in paymentRequests: type "request" / status "pending" while a
// withdraw request waits, type "paid" / status "done" once the admin has paid it
// (bank transfer or cash, recorded manually).
const { Op } = require("sequelize");
const { wallet, paymentRequests, sequelize } = require("../models");

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100 || 0;

function balanceFrom(walletSum, paidSum, pendingSum) {
  // earning rows are negative, so earned = −(sum of the driver's rows)
  const earned = round2(-(walletSum || 0));
  const paid = round2(paidSum);
  const pending = round2(pendingSum);
  return { earned, paid, pending, available: round2(earned - paid - pending) };
}

// A driver's wallet: earned, paid out, waiting in withdraw requests, available.
async function driverBalance(userId) {
  const [walletSum, paidSum, pendingSum] = await Promise.all([
    wallet.sum("amount", { where: { userId } }),
    paymentRequests.sum("amount", { where: { userId, type: "paid", status: "done" } }),
    paymentRequests.sum("amount", { where: { userId, type: "request", status: "pending" } }),
  ]);
  return balanceFrom(walletSum, paidSum, pendingSum);
}

// driverBalance for many drivers in three queries: { [userId]: balance + pendingRequests }.
async function driverBalances(userIds) {
  if (!userIds.length) return {};
  const [earnings, payouts] = await Promise.all([
    wallet.findAll({
      where: { userId: userIds },
      attributes: ["userId", [sequelize.fn("SUM", sequelize.col("amount")), "sum"]],
      group: ["userId"],
      raw: true,
    }),
    paymentRequests.findAll({
      where: {
        userId: userIds,
        [Op.or]: [
          { type: "paid", status: "done" },
          { type: "request", status: "pending" },
        ],
      },
      attributes: [
        "userId",
        "type",
        [sequelize.fn("SUM", sequelize.col("amount")), "sum"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["userId", "type"],
      raw: true,
    }),
  ]);
  const out = {};
  for (const id of userIds) {
    const earned = earnings.find((e) => e.userId === id);
    const paid = payouts.find((p) => p.userId === id && p.type === "paid");
    const pending = payouts.find((p) => p.userId === id && p.type === "request");
    out[id] = {
      ...balanceFrom(earned?.sum, paid?.sum, pending?.sum),
      pendingRequests: Number(pending?.count || 0),
    };
  }
  return out;
}

module.exports = { round2, driverBalance, driverBalances };
