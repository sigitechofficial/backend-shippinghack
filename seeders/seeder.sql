SET
    SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET
    AUTOCOMMIT = 0;

START TRANSACTION;

SET
    time_zone = "+00:00";

INSERT INTO `banners` VALUES (1, 'Banner', 'Test Banner', 'Public/Banners/bannerImage-1697201808032.jpg', 0, '2023-10-04 11:13:06', '2023-11-29 06:52:20'),
(2, 'Banner', 'Shipping Calculator', 'Public/Banners/bannerImage-1726817635823.webp', 1, '2023-10-04 11:13:06', '2024-09-20 07:33:55'),
(3, 'Banner', 'one package', 'Public/Banners/singlePackage.png', 1, '2023-10-04 11:13:06', '2023-10-13 12:48:38'),
(4, 'Banner', 'Multiple Packages', 'public/multiplePackages.png', 1, '2023-10-04 11:13:06', '2023-10-04 11:13:06'),
(5, 'Banner', 'Consolidation', 'Public/Banners/consolidation_pic.png', 1, '2023-10-04 11:13:06', '2023-10-30 13:17:05'),
(6, 'Banner', 'Banner 2.0', 'Public/Banners/bannerImage-1698672220960.jpg', 0, '2023-10-13 12:46:05', '2024-09-20 08:17:51'),
(7, 'Banner', 'Test', 'Public/Banners/bannerImage-1698729401393.jpg', 0, '2023-10-30 11:59:42', '2023-12-11 10:46:26'),
(8, 'Banner', 'testing', 'Public/Banners/bannerImage-1698667248887.jpg', 0, '2023-10-30 12:00:50', '2023-10-30 12:43:57'),
(9, 'Banner', 'test4', 'Public/Banners/bannerImage-1726817683600.webp', 0, '2024-09-20 07:34:26', '2024-09-20 07:34:46'),
(10, 'Banner', 'test3', 'Public/Banners/bannerImage-1726820477986.jfif', 0, '2024-09-20 08:21:17', '2024-09-20 08:21:28');


INSERT INTO `userTypes` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Customer', '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(2, 'Driver', '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(3, 'Business', '2024-07-25 11:34:51', '2024-07-25 11:34:51'),
(4, 'Merchant', '2024-09-12 07:28:13', '2024-09-12 07:28:13');


INSERT INTO `bookingStatuses` VALUES (1, 'Order Created', 'Your order has been created', '2023-09-26 07:55:31', '2023-09-26 07:55:31'),
(7, 'Received at Warehouse(USA warehouse)', 'Confirmation of order received by warehouse', '2023-09-26 07:56:14', '2023-09-26 07:56:14'),
(8, 'Re measurements/Labeled', 'Confirmation of re-measurements and labeling of package(s)', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(10, 'Ready to Ship', 'Order ready to be deliver to customer directly or indirectly', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(11, 'In Transit', 'Package in Transit', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(12, 'Outgoing /Received', 'when Transit received in Puerto Rico warehouse package will be in received', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(13, 'Driver Assigned/Accepted', 'Hang on! Your Order is arriving soon', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(14, 'Shipped', 'Order shipped directly to customer from usa warehouse via logistic company', '2023-10-25 11:24:02', '2023-10-25 11:24:02'),
(15, 'Reached (delivery)\r\n', 'Driver Reached at Delivery point', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(16, 'Pickedup (delivery)', 'Order has been picked by driver ', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(17, 'Ongoing/ Start ride', 'On the way', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(18, 'Delivered', 'Your order has been completed', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(19, 'Cancelled', 'Order has been cancelled ', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(20, 'Awaiting self pickup', 'Awaiting customer to pickup order from warehouse', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(21, 'Handed over to customer', 'Order picked by customer from warehouse', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(22, 'Hand over to Driver', 'hand over to delivery Driver', '2023-10-30 07:54:56', '2023-10-30 07:54:56');

INSERT INTO `bookingTypes` VALUES (1, 'International Shipping', 'Get your parcel delivered at Puerto Rico from USA', 'Public/International Shipping.png', 1, '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(2, 'Local Delivery', 'Send a quick parcel anywhere within Puerto Rico', 'public/local.png', 1, '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(3, 'Send one package', 'Ship a single package to a single address. Our simplest option!', 'Public/singlePackage.png', 2, '2023-10-04 11:07:03', '2023-10-04 11:07:03'),
(4, 'Send multiple packages to one address at the same time', 'Combine the box weights but not the boxes. Only available with select carriers', 'Public/multiplePackages.png', 2, '2023-10-04 11:07:03', '2023-10-04 11:07:03'),
(5, 'Consolidate multiple packages into one box and save big!', 'Have us combine your packages into one box and save up to 80 % on shipping!', 'Public/consolidation.png', 2, '2023-10-04 11:07:03', '2023-10-04 11:07:03'),
(6, 'Local Shipment', 'Get your parcel delivered at Puerto Rico from USA', 'Public/local.png', 1, '2023-10-04 11:07:03', '2023-10-04 11:07:03');

INSERT INTO `categories` VALUES (1, 'Document', 0, '/Public/Categories/document.png', 21, '2023-09-22 10:27:30', '2024-02-22 12:57:51'),
(2, 'Grocery', 1, '/Public/Categories/grocery.png', 20, '2023-10-16 13:00:10', '2024-02-22 12:59:17'),
(3, 'Clothes', 1, '/Public/Categories/clothes.png', 20, '2023-10-17 10:51:29', '2023-10-17 10:51:35'),
(4, 'testing', 0, NULL, 111, '2023-10-19 06:33:47', '2023-10-19 06:33:51'),
(5, 'Medicine', 0, '', 32, '2023-10-27 07:57:35', '2023-10-30 05:19:59'),
(9, 'Test2', 0, '', 10, '2023-10-30 05:20:17', '2023-10-30 05:20:26'),
(12, 'Test4', 0, '', 10, '2023-10-30 05:21:48', '2023-10-30 05:33:12'),
(14, 'test111', 0, '', 111, '2023-10-30 09:25:21', '2023-10-30 09:25:25'),
(16, 'Other', 0, '/Public/Categories/Others.png', 32, '2023-10-30 12:01:42', '2024-02-28 10:38:47'),
(17, 'foods', 0, '', 11, '2023-11-22 10:01:51', '2023-11-22 10:02:04'),
(18, 'aa', 0, '', 11, '2023-11-22 10:02:53', '2023-11-22 10:02:56'),
(19, 'a', 0, '', 1, '2023-11-22 10:17:36', '2023-11-22 10:17:39'),
(20, 'Food', 0, '/Public/Categories/food.png', 10, '2024-02-28 10:38:32', '2024-10-17 06:22:40'),
(21, 'Documents', 1, '/Public/Categories/document.png', 20, '2024-02-29 09:20:06', '2024-06-14 12:33:26'),
(22, 'b', 0, '', 11, '2024-02-29 09:20:16', '2024-02-29 09:20:23'),
(23, 'Medicines', 1, '/Public/Categories/medicine.png', 10, '2024-06-14 12:33:51', '2024-06-14 12:33:51'),
(24, 'Others', 1, '/Public/Categories/Others.png', 10, '2024-06-14 12:34:14', '2024-06-14 12:34:14'),
(25, 'jdcdjsc', 0, '', 12, '2024-09-20 08:19:49', '2024-09-20 08:19:54');

INSERT INTO `classifiedAs` VALUES (1, 'Admin', '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(2, 'Employee', '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(3, 'Warehouse', '2022-07-04 17:21:11', '2022-07-04 17:21:11');

INSERT INTO `deliveryTypes` VALUES (1, 'Delivery', 'Get Deliver at home', 1, NULL, '2023-09-26 07:41:48', '2023-09-26 07:41:48'),
(2, 'Self PickUp', 'Self pick by the user from the delivery warehouse\n', 1, NULL, '2023-09-26 07:42:23', '2023-09-26 07:42:23');


INSERT INTO `driverTypes` VALUES (1, 'Freelance', '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(2, 'Warehouse', '2022-07-04 17:21:11', '2022-07-04 17:21:11');

INSERT INTO `ecommerceCompanies` VALUES (1, 'amazon', 'description', 2.5, 1, 0, '2023-09-22 10:28:02', '2023-09-22 10:28:02'),
(2, 'Ebay', 'description', 2.5, 1, 0, '2023-09-22 10:28:02', '2023-09-22 10:28:02'),
(3, 'Ali Baba', 'description', 2.5, 1, 0, '2023-09-22 10:28:02', '2023-09-22 10:28:02'),
(4, 'Other', 'description', 2.5, 1, 0, '2023-09-22 10:28:02', '2023-09-22 10:28:02');

INSERT INTO `FAQs` VALUES (1, 'How Can I Track My Shipment?', 'You can easily track your shipment by checking History section in your profile. If you encounter any issues, feel free to contact our customer support team for assistance.', 1, 0, '2023-10-02 07:21:43', '2024-10-16 14:13:08'),
(2, 'What Are Your Shipping Rates and Delivery Times?', 'Our shipping rates and delivery times vary depending on the destination, package size, and the selected shipping method.', 1, 0, '2023-10-02 07:21:57', '2024-10-16 14:06:21'),
(3, 'What Should I Do If My Shipment Is Delayed or Damaged?', 'We strive to ensure that all shipments arrive on time and in perfect condition. However, in the rare event that your shipment is delayed or arrives damaged, please contact our customer support team immediately. Provide your order number and details about the issue, and we will work swiftly to resolve the problem.', 1, 0, '2023-10-16 09:23:00', '2024-10-16 14:07:16'),
(4, 'Can I Change or Cancel My Order After It Has Been Placed?', 'Yes, you can change or cancel your order within a specific time frame after placing it.', 1, 0, '2024-09-20 08:30:16', '2024-10-16 14:14:03'),
(5, 'What Should I Do If I Receive the Wrong Item or Missing Parts?', 'We strive to ensure that all orders are accurate and complete. If you receive the wrong item or notice missing parts in your shipment, please contact us immediately.', 1, 0, '2024-10-16 14:15:29', '2024-10-16 14:15:29');

INSERT INTO `features` VALUES (1, 'units', 1, 'units', 'both', '2023-10-13 04:20:18', '2023-10-13 04:20:18'),
(2, 'faqs', 1, 'faqs', 'admin', '2023-10-13 04:21:45', '2023-10-13 04:21:45'),
(3, 'logistic Companyies', 1, 'Logistic Companies', 'admin', '2023-10-13 04:21:45', '2023-10-13 04:21:45'),
(4, 'users', 1, 'users', 'admin', '2023-10-13 04:23:28', '2023-10-13 04:23:28');

INSERT INTO `generalCharges` VALUES (1, 'charge', 'WtoVW', 50006, '  Weight to volumetric-weight conversion', '2023-01-03 14:51:00', '2024-10-21 08:11:36'),
(2, 'charge', 'VAT', 20, '  VAT charges (%)', '2023-01-03 14:51:00', '2024-09-20 08:25:30'),
(3, 'charge', 'packing', 10, ' Packing fee', '2023-01-03 14:51:49', '2024-09-20 08:25:42'),
(4, 'charge', 'service', 15, '  Service charges', '2023-01-03 14:51:49', '2024-09-20 08:25:51'),
(5, 'Base Distance for vehicles', 'baseDistance', 5, 'Base distance to calculate driver earnings in miles', '2023-02-08 11:51:10', '2024-09-20 08:25:58'),
(6, 'Driver Percentage', 'driver', 70, '  Service charges', '2023-11-16 14:51:49', '2024-09-20 08:26:05');


-- Column names are listed explicitly: without them the values are matched by column
-- position, and the table's order (…flashCharges, divisor, standardCharges…) differs
-- from this dump's order, which silently loads divisor/charges into the wrong columns.
-- divisor = dimensional weight divisor for inches/lbs (139 = standard international).
INSERT INTO `logisticCompanies` (`id`, `title`, `description`, `status`, `flashCharges`, `standardCharges`, `logo`, `deleted`, `createdAt`, `updatedAt`, `divisor`) VALUES
(1, 'FedEx', 'Charge per weight tr54', 1, 3.75, 2.5, 'Public/Logos/companyLogo-1697715590221.png', 0, '2023-09-22 10:26:42', '2024-02-22 11:33:02', 139),
(2, 'DHL', 'Charge per weight', 1, 10, 29.95, 'Public/Logos/companyLogo-1697715612210.png', 0, '2023-10-04 11:08:21', '2023-10-19 12:23:44', 139),
(3, 'UPS', 'Charge per weight', 1, 54, 4, 'Public/Logos/companyLogo-1726722602896.png', 0, '2023-10-04 11:49:51', '2024-09-19 05:12:36', 139),
(4, 'Leopards', 'Charge per weight', 1, 48, 12, 'Public/Logos/companyLogo-1726722735989.jfif', 0, '2023-10-04 12:53:17', '2024-09-19 05:12:15', 139),
(5, 'TCS', 'Charge per weight', 1, 50, 10, 'Public/Logos/companyLogo-1697715943526.png', 0, '2023-10-04 12:54:26', '2023-10-19 12:24:03', 139),
(9, 'test', 'testing', 0, 15, 12, 'Public/Logos/companyLogo-1726817219558.jpg', 0, '2024-09-20 07:26:59', '2024-09-20 07:27:04', 139);



INSERT INTO `merchantCategories` VALUES (1, 'Men\'s ', 1, '2024-09-09 05:53:36', '2024-09-09 05:55:50'),
(2, 'Jeans', 1, '2024-09-09 07:43:10', '2024-09-09 07:43:10');

INSERT INTO `merchantOrderStatuses` VALUES (1, 'InTransit', ' when an order is created', '2024-09-14 12:23:12', '2024-09-24 07:50:07'),
(2, 'Confirmed ', ' once the warehouse physically verifies ', '2024-09-14 12:24:05', '2024-09-14 12:24:05'),
(3, 'Short', 'if there\'s a discrepancy in quantity.', '2024-09-14 12:27:19', '2024-09-18 12:45:23'),
(4, 'Available ', ' when the stock is placed and ready for ', '2024-09-14 12:28:14', '2024-09-14 12:28:14'),
(5, 'Putaway', 'once the stock is placed but not yet ava', '2024-09-14 12:29:32', '2024-09-14 12:29:32'),
(6, 'Picking ', 'when the warehouse starts picking items', '2024-09-14 12:37:03', '2024-09-14 12:37:03'),
(7, 'Packing ', 'when the items are packed', '2024-09-14 12:37:41', '2024-09-14 12:37:41'),
(8, 'On Hold ', 'for damaged or problematic stock ', '2024-09-14 12:38:37', '2024-09-14 12:38:37'),
(9, 'Picked', 'When warehouse associate accept the orde', '2024-09-14 12:40:12', '2024-09-24 09:20:38'),
(10, 'Over', 'When Stock send by merchant in Geater th', '2024-09-18 12:47:56', '2024-09-18 12:47:56'),
(11, 'Packed', 'When Assocuate Packed the Order', '2024-09-25 06:54:28', '2024-09-25 06:54:54'),
(12, 'Out for Delivery', 'Order which is out for Delivery ', '2024-09-27 10:59:02', '2024-09-27 10:59:02');



INSERT INTO `restrictedItems` VALUES (1, 'Explosive', 'Public/RestrictedItems/_0001_explosive.png', 0, 1, '2023-06-21 05:44:47', '2023-11-29 12:06:12'),
(2, 'Antiques', 'Public/RestrictedItems/_0002_antiques.png', 0, 1, '2023-06-21 05:46:19', '2023-11-30 09:42:14'),
(3, 'Tobacco', 'Public/RestrictedItems/_0002_tobacco.png', 1, 0, '2023-06-21 05:46:37', '2023-10-30 07:43:22'),
(4, 'Knives', 'Public/RestrictedItems/_0003_Knives.png', 1, 0, '2023-09-01 12:29:45', '2023-09-04 10:20:48'),
(5, 'Testtt', 'Public/RestrictedItems/restricteditem-1700550396425.jpg', 0, 1, '2023-11-21 07:06:36', '2023-11-21 07:07:47'),
(6, 'Testing', 'Public/RestrictedItems/restricteditem-1700551743152.jpg', 0, 1, '2023-11-21 07:15:39', '2023-11-21 07:29:17'),
(7, 'aaa', 'Public/RestrictedItems/restricteditem-1700647968575.png', 0, 1, '2023-11-22 10:12:48', '2023-11-22 10:15:46'),
(8, 'Glass', 'Public/RestrictedItems/restricteditem-1701858203350.png', 1, 0, '2023-12-06 10:23:23', '2023-12-06 10:23:23'),
(9, 'Antiques', 'Public/RestrictedItems/restricteditem-1701858234510.png', 1, 0, '2023-12-06 10:23:54', '2023-12-06 10:23:54'),
(10, 'Explosive', 'Public/RestrictedItems/restricteditem-1701858260950.png', 1, 0, '2023-12-06 10:24:20', '2023-12-06 10:24:20'),
(11, 'Chemicals', 'Public/RestrictedItems/restricteditem-1701858300354.png', 1, 0, '2023-12-06 10:25:00', '2023-12-06 10:25:00'),
(12, 'Satellite', 'Public/RestrictedItems/restricteditem-1701858335374.png', 1, 0, '2023-12-06 10:25:35', '2023-12-06 10:25:35'),
(13, 'Cheques', 'Public/RestrictedItems/restricteditem-1701858361612.png', 1, 0, '2023-12-06 10:26:01', '2023-12-06 10:26:01'),
(14, 'Cash', 'Public/RestrictedItems/restricteditem-1701858394974.png', 1, 0, '2023-12-06 10:26:34', '2023-12-06 10:26:34'),
(15, 'Weapon', 'Public/RestrictedItems/restricteditem-1701858415829.png', 1, 0, '2023-12-06 10:26:55', '2023-12-06 10:26:55'),
(16, 'Gases', 'Public/RestrictedItems/restricteditem-1701858443482.png', 1, 0, '2023-12-06 10:27:23', '2023-12-06 10:27:23'),
(17, 'Alcohol', 'Public/RestrictedItems/restricteditem-1701858590169.png', 1, 0, '2023-12-06 10:27:57', '2023-12-06 10:29:50'),
(18, 'Drugs', 'Public/RestrictedItems/restricteditem-1701858615299.png', 1, 0, '2023-12-06 10:30:15', '2023-12-06 10:30:15'),
(19, 'Gambling', 'Public/RestrictedItems/restricteditem-1701858662763.png', 1, 0, '2023-12-06 10:31:02', '2023-12-06 10:31:02'),
(20, 'Liquid', 'Public/RestrictedItems/restricteditem-1701858682972.png', 1, 0, '2023-12-06 10:31:22', '2023-12-06 10:31:22'),
(21, 'Fire', 'Public/RestrictedItems/restricteditem-1701858698641.png', 1, 0, '2023-12-06 10:31:38', '2023-12-06 10:31:38');

INSERT INTO `roles` VALUES (1, 'Supervisor', 1, '2023-10-12 12:36:02', '2023-10-13 08:00:46', NULL),
(2, 'IT Guy', 1, '2023-10-13 06:37:20', '2023-10-13 06:37:20', NULL),
(3, 'PM', 1, '2024-09-20 08:30:46', '2024-09-20 08:30:46', NULL);

INSERT INTO `shipmentTypes` VALUES (1, 'Flash Delivery', 'Dummy Text', 1, NULL, '2022-07-04 17:21:11', '2022-07-04 17:21:11'),
(2, 'Standard Delivery', 'Dummy Text', 1, NULL, '2022-07-04 17:21:11', '2022-07-04 17:21:11');

INSERT INTO `supports` VALUES (1, 'email', 'support_email', 'support@gmail.com', 1, '2023-02-06 10:51:06', '2023-11-22 10:07:25'),
(2, 'phone', 'support_phone', '+929007860113', 1, '2023-02-06 10:51:06', '2023-11-22 10:07:29');

INSERT INTO `units` VALUES (1, 'length', 'inch', 'in', NULL, 1, 1.0000, 0, '2023-08-09 09:55:36', '2023-10-12 12:43:49'),
(2, 'weight', 'lbs', 'lbs', NULL, 1, 1.0000, 0, '2023-08-09 09:56:11', '2023-10-12 10:18:01'),
(3, 'distance', 'kilometer', 'km', NULL, 1, 1.0000, 0, '2023-08-09 09:58:17', '2023-08-09 09:58:17'),
(4, 'currency', 'USD', '$', NULL, 1, 1.0000, 0, '2023-08-09 09:58:50', '2023-11-01 07:37:43'),
(5, 'length', 'cm', 'cm', NULL, 1, 1.0000, 0, '2023-10-12 10:29:20', '2023-10-12 10:29:20'),
(6, 'weight', 'kilogram', 'kg', NULL, 1, 0.4536, 0, '2023-08-09 09:56:11', '2023-10-12 10:18:01'),
(7, 'distance', 'test', 'test', NULL, 1, 2.0000, 0, '2024-09-20 08:22:06', '2024-09-20 08:22:06'),
(8, 'currency', 'Kiran', 'k', NULL, 1, 11.0000, 0, '2024-09-20 08:22:46', '2024-09-20 08:22:46');


INSERT INTO `addressDBs` (`id`, `title`, `streetAddress`, `building`, `floor`, `apartment`, `district`, `city`, `province`, `country`, `postalCode`, `lat`, `lng`, `status`, `type`, `deleted`, `createdAt`, `updatedAt`, `structureTypeId`, `userId`, `warehouseId`) VALUES
(36, 'Warehouse USA', '655 South Hope Street 901', 'R-22', '4', ' main', ' new  District', 'Los Angeles', ' California', 'USA', '90017', '34.0466422', '-118.2642062', 1, '', 0, '2023-10-09 07:58:19', '2023-10-17 06:18:28', NULL, NULL, NULL),
(42, 'Warehouse Puerto Rico', '560 Juan J Jimenez street', 'rr', '2', 'main', ' dcnu', 'San Juan', 'Puerto Rico', 'USA', '00918', '18.411919', '-66.0744354', 1, '', 0, '2023-10-13 10:55:51', '2023-10-13 10:55:51', NULL, NULL, NULL);


INSERT INTO `warehouses` VALUES (1, 'admin@shippinghack.com', '$2b$10$dq1.OiwGQaGiO7.SQ1RcoOC2ZnRW9v48s2oSRuXFGIcoQxsTmRByq', 'Super Admin', NULL, 1, '2179be7w9sk19', ' +92', '1234567 ', NULL, '2023-01-30 11:41:46', '2024-10-31 07:45:49', NULL, 1, NULL, NULL),
(2, 'usa@gmail.com', '$2b$10$g6QAKL1kU2JmDU20iLnB1uAzpd2xhWBw3cAK2PazT3D5NaKBgeLG6', 'Warehouse USA', 'usa@gmail.com', 1, 'saasas4', '+507', '12165452', 'usa', '2023-09-26 05:45:33', '2024-11-13 06:58:44', 36, 3, NULL, NULL),
(3, 'rico@gmail.com', '$2b$10$9RGeFkm4xGftRQRfjfojpOOvuwmQb/JsXgZDjPbpi5AnmZt/AN8Ey', 'Warehouse Puerto Rico', NULL, 1, 'saasas4', '+92', '12318413', 'rico', '2023-09-26 05:45:47', '2024-10-11 12:28:40', 42, 3, NULL, NULL),
(18, 'kiran@gmail.com', '$2b$10$bn3leoFp3Gi4juZInhOH5Oh1pxVj5rypvhsDv/HvUc/wCkbWYd/o.', 'Kiran', NULL, 1, '2179be7w9sk19', '+507', '1231718', NULL, '2024-03-01 06:51:05', '2024-08-06 10:03:15', NULL, 2, 1, 1),
(19, 'hamza@gmail.com', '$2b$10$yKd0lM5AZsBivWiTsKFCeOt/eGnUwXy1JID3SuMEuvGCdSWt17vCy', 'Hamza', NULL, 1, NULL, '+507', '632737272', NULL, '2024-09-20 07:13:28', '2024-09-20 07:13:28', NULL, 2, 2, 1);

INSERT INTO `webPolicies` VALUES (1, 'Privacy Policy', 'Privacy Policy of The Shipping Hack.....', NULL, '2023-10-11 07:10:13', '2023-12-26 09:54:43'),
(2, 'Terms & Conditions', 'Terms & Conditions of The Shipping Hack.', NULL, '2023-10-11 07:10:41', '2023-12-01 06:16:27');

INSERT INTO `weightCharges` VALUES (1, 'Range 1', 0, 1, 0.25, 'kg', '2023-01-03 14:54:56', '2023-01-03 14:54:56'),
(2, 'Range 2', 1, 10, 6.25, 'kg', '2023-03-09 10:10:44', '2023-03-09 10:10:44'),
(3, 'Range 3', 10, 11000, 118.50, 'kg', '2023-03-09 10:44:02', '2024-02-29 06:25:41');

INSERT INTO `driverPaymentSystems` (`id`, `systemType`, `key`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Distance Based', 'distance_based', 1, '2023-02-08 11:49:33', '2023-04-04 10:13:22'),
(2, 'Ride Based', 'ride_based', 0, '2023-02-08 11:49:33', '2023-04-04 10:13:22');

INSERT INTO `links` (`id`, `title`, `key`, `link`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'Privacy Policy', 'privacyPolicy', 'https://pps507.com/privacy.html', 1, '2023-02-15 15:26:52', '2023-02-15 15:26:52'),
(2, 'FAQs', 'FAQ', 'https://pps507.com', 1, '2023-02-15 15:26:52', '2023-02-15 15:26:52');

INSERT INTO `volumetricWeightCharges` (`id`, `title`, `startValue`, `endValue`, `price`, `unit`, `createdAt`, `updatedAt`) VALUES
(1, 'R2', 200, 400, 3.33, 'cm3', '2023-01-03 14:54:15', '2023-11-01 07:42:13'),
(2, 'R2', 200, 1000, 9.66, 'cm3', '2023-03-09 10:11:22', '2023-11-01 07:41:44'),
(3, 'R3', 500, 5000, 50.00, 'cm3', '2023-03-09 10:44:31', '2023-11-01 07:42:36');


INSERT INTO `appUnits` (`id`, `status`, `deleted`, `createdAt`, `updatedAt`, `weightUnitId`, `lengthUnitId`, `distanceUnitId`, `currencyUnitId`) VALUES
(1, 1, 0, '2023-09-22 12:59:43', '2023-10-12 10:47:23', 2, 1, 3, 4);


INSERT INTO `baseUnits` (`id`, `status`, `deleted`, `createdAt`, `updatedAt`, `weightUnitId`, `lengthUnitId`, `distanceUnitId`, `currencyUnitId`) VALUES
(1, 1, 0, '2023-09-26 07:41:02', '2023-09-26 07:41:02', 2, 1, 3, 4);

INSERT INTO `vehicleTypes` (`id`, `title`, `image`, `status`, `baseRate`, `perUnitRate`, `perRideCharge`, `weightCapacity`, `volumeCapacity`, `createdAt`, `updatedAt`, `appUnitId`) VALUES
(1, 'Car', 'Public/Images/VehicleTypes/vehicleImage-Car-1699867786982.png', 0, 36.00, 64.00, 0.00, 3000.00, 22122.00, '2023-10-02 12:13:14', '2024-02-22 12:07:04', NULL),
(2, 'Truck', 'Public/Images/VehicleTypes/vehicleImage-Truck-1699867649257.png', 0, 18.00, 18.00, 0.00, 80000.00, 240000.00, '2023-10-02 12:15:48', '2024-02-22 12:59:39', NULL),
(3, 'Vehicle 21', 'Public/Images/VehicleTypes/vehicleImage-Vehicle 21-1697442127683.png', 0, 401.00, 321.00, 0.00, 10010.00, 11500.00, '2023-10-04 09:55:08', '2024-02-22 12:33:35', NULL),
(4, 'Bike', 'Public/Images/VehicleTypes/vehicleImage-a-1697442079910.png', 0, 1.00, 1.00, 0.00, 1.00, 1.00, '2023-10-16 07:41:21', '2024-02-22 13:00:38', NULL),
(11, 'Car', 'Public/Images/VehicleTypes/vehicleImage-Car-1708606902147.webp', 0, 10.00, 10.00, 0.00, 10.00, 10.00, '2024-02-22 13:01:42', '2024-02-28 10:26:41', NULL),
(12, 'Car', 'Public/Images/VehicleTypes/vehicleImage-Car-1726817283774.png', 1, 10.00, 5.00, 0.00, 100000.00, 100000.00, '2024-02-28 10:29:20', '2024-09-20 07:28:03', NULL),
(13, 'Truck', 'Public/Images/VehicleTypes/vehicleImage-Truck-1726817330369.jfif', 1, 50.00, 30.00, 0.00, 100000.00, 100000.00, '2024-02-28 10:30:50', '2024-09-20 07:28:50', NULL),
(14, 'bike', 'Public/Images/VehicleTypes/vehicleImage-bike-1726817399599.png', 1, 5.00, 10.00, 0.00, 200.00, 300.00, '2024-09-20 06:24:10', '2024-09-20 07:30:08', NULL),
(15, 'test', 'Public/Images/VehicleTypes/vehicleImage-test-1726817444271.jfif', 0, 33.00, 3.00, 0.00, 333.00, 3333.00, '2024-09-20 07:30:44', '2024-09-20 07:30:53', NULL);


INSERT INTO `distanceCharges` VALUES (3, 'Z2', 1, 110, 1.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 2),
(5, 'Z3', 111, 210, 10.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 2),
(6, 'Z4', 211, 310, 1500.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 12),
(7, 'C2', 1, 110, 1.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 1),
(8, 'C3', 111, 210, 10.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 1),
(9, 'C4', 211, 310, 100.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 1),
(10, 'B2', 1, 110, 1.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 3),
(11, 'B3', 111, 210, 10.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 3),
(12, 'B4', 211, 310, 100.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 3),
(13, 'T2', 1, 110, 1.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 4),
(14, 'T3', 111, 210, 10.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 4),
(15, 'T4', 211, 310, 100.00, NULL, '2023-10-16 08:58:50', '2023-10-24 06:23:51', 4),
(16, 'aa', 1000, 1e15, 10.00, NULL, '2024-02-29 06:26:21', '2024-02-29 06:26:21', NULL),
(17, 'Z5', 311, 5500, 2000.00, NULL, '2024-02-29 12:37:49', '2024-02-29 12:37:49', 12),
(19, 'Z1', 1, 110, 500.00, NULL, '2024-02-29 12:37:49', '2024-02-29 12:37:49', 12),
(20, 'Z6', 111, 210, 1000.00, NULL, '2024-02-29 12:37:49', '2024-02-29 12:37:49', 12);



INSERT INTO `logisticCompanyCharges`(`id`, `startValue`, `endValue`, `ETA`, `charges`, `status`, `deleted`, `flash`, `createdAt`, `updatedAt`, `logisticCompanyId`, `bookingType`) VALUES
(2, 0, 30, '5-7', 45.00, 1, 1, 0, '2023-10-12 11:19:28', '2024-10-31 14:46:34', 5, 'International'),
(3, 30, 100, '2-3', 75.00, 1, 1, 0, '2023-10-13 11:59:07', '2024-10-31 14:46:37', 5, 'International'),
(5, 101, 1000000, '10-11', 200.00, 1, 1, 0, '2023-10-16 06:36:20', '2024-10-31 14:46:39', 5, 'International'),
(6, 0, 50, '5-7', 4.22, 1, 1, 0, '2023-10-12 11:19:28', '2024-10-31 14:46:57', 1, 'International'),
(8, 51, 150, '2-3', 2.38, 1, 0, 0, '2023-10-16 06:23:33', '2024-02-28 12:05:23', 1, 'International'),
(10, 0, 50, '5-7', 5.22, 1, 1, 0, '2023-10-12 11:19:28', '2024-10-31 14:47:20', 2, 'International'),
(11, 51, 150, '2-3', 3.63, 1, 1, 0, '2023-10-13 11:59:07', '2024-10-31 14:46:43', 2, 'International'),
(15, 100, 1000, NULL, 45.00, 0, 0, 0, '2024-02-21 12:52:48', '2024-02-21 12:52:48', 4, 'International'),
(16, 0, 20, NULL, 7.00, 1, 0, 0, '2024-02-21 12:52:48', '2024-02-21 12:52:48', 1, 'Local'),
(17, 21, 150, NULL, 5.00, 1, 0, 1, '2024-02-21 12:52:48', '2024-09-20 08:28:49', 1, 'Local'),
(18, 4, 4, NULL, 4.00, 0, 0, 0, '2024-09-20 08:28:04', '2024-09-20 08:28:04', 2, 'International'),
(19, 1, 100, NULL, 4.00, 1, 1, 0, '2024-09-20 08:29:07', '2024-10-31 14:46:46', 3, 'Local'),
(20, 0, 50, NULL, 4.22, 1, 0, 0, '2024-10-31 14:48:06', '2024-10-31 14:48:06', 1, 'International');



COMMIT;