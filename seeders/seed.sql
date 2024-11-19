SET
    SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

SET
    AUTOCOMMIT = 0;

START TRANSACTION;

SET
    time_zone = "+00:00";

-- Dumping Data into user Types
INSERT INTO
    `usertypes` (`id`, `name`, `createdAt`, `updatedAt`)
VALUES
    (
        1,
        'Customer',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    ),
    (
        2,
        'Driver',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );
    (
        3,
        'Business',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );
    (
        4,
        'Merchant',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );

-- Dumping Data into warehouse user types
INSERT INTO
    `classifiedAs` (`id`, `name`, `createdAt`, `updatedAt`)
VALUES
    (
        1,
        'Admin',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    ),
    (
        2,
        'Employee',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    ),
    (
        3,
        'Warehouse',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );

-- Dumping into driver type
INSERT INTO
    `drivertypes` (`id`, `name`, `createdAt`, `updatedAt`)
VALUES
    (
        1,
        'Freelance',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    ),
    (
        2,
        'Warehouse',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );

-- Dumping into users (guest user)
INSERT INTO
    `users` (`id`, `email`,`countryCode`, `createdAt`, `updatedAt`)
VALUES
    (
        1,
        'guestuser@gmail.com',
        NULL,
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
        
    );

-- Dumping into bookingtype
INSERT INTO
    `bookingtypes` (
        `id`,
        `title`,
        `description`,
        `status`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'International Shipping',
        'Get your parcel delivered at Puerto Rico from USA',
        '1',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    ),
    (
        2,
        'Send a Parcel',
        'Send a quick parcel within Puerto Rico',
        '1',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );

-- Dumping into shipmenttype
INSERT INTO
    `shipmenttypes` (
        `id`,
        `title`,
        `description`,
        `status`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'Flash Delivery',
        'Dummy Text',
        '1',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    ),
    (
        2,
        'Standard Delivery',
        'Dummy Text',
        '1',
        '2022-07-04 17:21:11',
        '2022-07-04 17:21:11'
    );

--
-- Dumping data for table `distanceCharges`
--
INSERT INTO
    `distanceCharges` (
        `id`,
        `title`,
        `startValue`,
        `endValue`,
        `price`,
        `unit`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'Z1',
        0,
        50,
        '1.30',
        'miles',
        '2023-01-03 14:49:45',
        '2023-04-04 10:07:13'
    ),
    (
        2,
        'Z2',
        51,
        500,
        '3.25',
        'miles',
        '2023-03-09 10:09:36',
        '2023-03-13 04:53:33'
    );

INSERT INTO
    `driverPaymentSystems` (
        `id`,
        `systemType`,
        `key`,
        `status`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'Distance Based',
        'distance_based',
        1,
        '2023-02-08 11:49:33',
        '2023-04-04 10:13:22'
    ),
    (
        2,
        'Ride Based',
        'ride_based',
        0,
        '2023-02-08 11:49:33',
        '2023-04-04 10:13:22'
    );

--
-- Dumping data for table `generalCharges`
--
INSERT INTO
    `generalCharges` (
        `id`,
        `title`,
        `key`,
        `value`,
        `information`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'charge',
        'WtoVW',
        5000,
        '  Weight to volumetric-weight conversion',
        '2023-01-03 14:51:00',
        '2023-04-04 10:04:31'
    ),
    (
        2,
        'charge',
        'VAT',
        0,
        '  VAT charges (%)',
        '2023-01-03 14:51:00',
        '2023-04-04 06:13:12'
    ),
    (
        3,
        'charge',
        'packing',
        0,
        ' Packing fee',
        '2023-01-03 14:51:49',
        '2023-03-21 10:07:55'
    ),
    (
        4,
        'charge',
        'service',
        0,
        '  Service charges',
        '2023-01-03 14:51:49',
        '2023-03-21 10:07:59'
    ),
    (
        5,
        'Base Distance for vehicles',
        'baseDistance',
        3,
        'Base distance to calculate driver earnings in miles',
        '2023-02-08 11:51:10',
        '2023-02-08 11:51:10'
    );

--
-- Dumping data for table `links`
--
INSERT INTO
    `links` (
        `id`,
        `title`,
        `key`,
        `link`,
        `status`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'Privacy Policy',
        'privacyPolicy',
        'https://pps507.com/privacy.html',
        1,
        '2023-02-15 15:26:52',
        '2023-02-15 15:26:52'
    ),
    (
        2,
        'FAQs',
        'FAQ',
        'https://pps507.com',
        1,
        '2023-02-15 15:26:52',
        '2023-02-15 15:26:52'
    );

--
-- Dumping data for table `supports`
--
INSERT INTO
    `supports` (
        `id`,
        `title`,
        `key`,
        `value`,
        `status`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'email',
        'support_email',
        'support@gmail.com',
        1,
        '2023-02-06 10:51:06',
        '2023-04-13 10:42:30'
    ),
    (
        2,
        'phone',
        'support_phone',
        '+923117860111',
        1,
        '2023-02-06 10:51:06',
        '2023-03-01 11:30:24'
    );

--
-- Dumping data for table `volumetricWeightCharges`
--
INSERT INTO
    `volumetricWeightCharges` (
        `id`,
        `title`,
        `startValue`,
        `endValue`,
        `price`,
        `unit`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'R1',
        0,
        400,
        '3.33',
        'cm3',
        '2023-01-03 14:54:15',
        '2023-04-04 10:08:58'
    ),
    (
        2,
        'R2',
        401,
        1000,
        '9.66',
        'cm3',
        '2023-03-09 10:11:22',
        '2023-03-10 12:12:26'
    ),
    (
        3,
        'R3',
        1001,
        5000,
        '30.00',
        'cm3',
        '2023-03-09 10:44:31',
        '2023-03-09 10:44:31'
    );

--
-- Dumping data for table `warehouses` (creating admin)
--
INSERT INTO
    `warehouses` (
        `id`,
        `email`,
        `password`,
        `status`,
        `dvToken`,
        `companyName`,
        `countryCode`,
        `phoneNum`,
        `createdAt`,
        `updatedAt`,
        `addressDBId`,
        `classifiedAId`,
        `roleId`
    )
VALUES
    (
        1,
        'admin@shippinghack.com',
        '$2b$10$dq1.OiwGQaGiO7.SQ1RcoOC2ZnRW9v48s2oSRuXFGIcoQxsTmRByq',
        1,
        '2121-pkl-pll',
        'Super Admin',
        ' +92',
        '1234567 ',
        '2023-01-30 11:41:46',
        '2023-04-14 05:47:19',
        NULL,
        1,
        NULL
    );

--
-- Dumping data for table `weightCharges`
--
INSERT INTO
    `weightCharges` (
        `id`,
        `title`,
        `startValue`,
        `endValue`,
        `price`,
        `unit`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'Range 1',
        0,
        1,
        '0.25',
        'kg',
        '2023-01-03 14:54:56',
        '2023-01-03 14:54:56'
    ),
    (
        2,
        'Range 2',
        1,
        10,
        '6.25',
        'kg',
        '2023-03-09 10:10:44',
        '2023-03-09 10:10:44'
    ),
    (
        3,
        'Range 3',
        11,
        100,
        '18.50',
        'kg',
        '2023-03-09 10:44:02',
        '2023-03-09 10:44:02'
    );

INSERT INTO
    `units` (
        `id`,
        `type`,
        `name`,
        `symbol`,
        `desc`,
        `status`,
        `conversionRate`,
        `deleted`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'length',
        '',
        'cm',
        NULL,
        '1',
        '1.0000',
        '0',
        '2023-08-09 09:55:36',
        '2023-08-09 09:55:36'
    ),
    (
        2,
        'weight',
        'kilograms',
        'kg',
        NULL,
        '1',
        '1.0000',
        '0',
        '2023-08-09 09:56:11',
        '2023-08-09 09:56:11'
    ),
    (
        3,
        'distance',
        'kilometer',
        'km',
        NULL,
        '1',
        '1.0000',
        '0',
        '2023-08-09 09:58:17',
        '2023-08-09 09:58:17'
    ),
    (
        4,
        'currency',
        'USD',
        '$',
        NULL,
        '1',
        '1.0000',
        '0',
        '2023-08-09 09:58:50',
        '2023-08-09 09:58:50'
    );

-- INSERT INTO
--     'baseunits' (
--         `status`,
--         `deleted`,
--         `weightUnitId`,
--         `lengthUnitId`,
--         `distanceUnitId`,
--         `currencyUnitId`
--     )
-- VALUES
--     (
--         1,
--         0,
--         2,
--         1,
--         3,
--         4
--     );
INSERT INTO
    `appunits` (
        `status`,
        `deleted`,
        `createdAt`,
        `updatedAt`,
        `weightUnitId`,
        `lengthUnitId`,
        `distanceUnitId`,
        `currencyUnitId`
    )
VALUES
    (
        '1',
        '0',
        '2023-09-22 12:59:43',
        '2023-09-22 12:59:43',
        '2',
        '1',
        '3',
        '4'
    );

INSERT INTO
    `logisticcompanies` (
        `title`,
        `description`,
        `status`,
        `flashCharges`,
        `standardCharges`,
        `logo`,
        `deleted`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        'fedx',
        '',
        '1',
        '1',
        '2.95',
        '',
        '0',
        '2023-09-22 10:26:42',
        '2023-09-22 10:26:42'
    );

INSERT INTO
    `ecommercecompanies` (
        `title`,
        `description`,
        `charge`,
        `status`,
        `deleted`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        'amazon',
        'description',
        '2.5',
        '1',
        '0',
        '2023-09-22 10:28:02',
        '2023-09-22 10:28:02'
    );

INSERT INTO
    `categories` (
        `title`,
        `status`,
        `image`,
        `charge`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        'document',
        '1',
        '',
        NULL,
        '2023-09-22 10:27:30',
        '2023-09-22 10:27:30'
    );

INSERT INTO
    `deliverytypes` (
        `title`,
        `description`,
        `status`,
        `charge`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        'Delivery',
        'Get Deliver at home',
        '1',
        NULL,
        '2023-09-26 07:41:48',
        '2023-09-26 07:41:48'
    ),
    (
        'Self PickUp',
        'Self pick by the user from the delivery warehouse\r\n',
        '1',
        NULL,
        '2023-09-26 07:42:23',
        '2023-09-26 07:42:23'
    );
INSERT INTO
    `bookingstatuses` (
        `title`,
        `description`,
        `createdAt`,
        `updatedAt`
    ) 
VALUES
(1, 'Order Created\r\n', 'Your order has been \r\ncreated', '2023-09-26 07:55:31', '2023-09-26 07:55:31'),
(7, 'Received at Warehouse (USA warehouse)\r\n', 'Confirmation of order received by warehouse', '2023-09-26 07:56:14', '2023-09-26 07:56:14'),
(8, 'Re measurements/Labeled', 'Confirmation of re-measurements and labeling of package(s)', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(10, 'Ready to Ship\r\n', 'Order ready to be deliver to customer directly or indirectly', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(11, 'In Transit\r\n', 'Package in Transit', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(12, 'Outgoing /Received\r\n', 'when Transit received in Puerto Rico warehouse package will be in received', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(13, 'Driver Assigned/Accepted\r\n', 'Hang on! Your Order is arriving soon', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(14, 'shipped', 'Order shipped directly to customer from usa warehouse via logistic company', '2023-10-25 11:24:02', '2023-10-25 11:24:02'),
(15, 'Reached (delivery)\r\n', 'Driver Reached at Wearhouse', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(16, 'Pickedup (delivery)\r\n', 'order has been picked by customer/driver ', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(17, 'Ongoing/ Start ride\r\n', 'On the way', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(18, 'Delivered\r\n', 'Your order has been completed', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(19, 'Cancelled\r\n', 'Order has been cancelled ', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(20, 'Awaiting self pickup\r\n', 'Awaiting customer to pickup order from warehouse', '2023-09-26 07:57:40', '2023-09-26 07:57:40'),
(21, 'Handed over to customer\r\n', 'Order picked by customer from warehouse', '2023-09-26 07:57:40', '2023-09-26 07:57:40');
INSERT INTO
    `warehouses` (
        `email`,
        `password`,
        `companyName`,
        `companyEmail`,
        `status`,
        `dvToken`,
        `countryCode`,
        `phoneNum`,
        `located`,
        `createdAt`,
        `updatedAt`,
        -- `addressDBId`,
        `classifiedAId`,
        `roleId`,
        `employeeOf`
    )
VALUES
    (
        'demo@gmail.com',
        '$2b$10$g6QAKL1kU2JmDU20iLnB1uAzpd2xhWBw3cAK2PazT3D5NaKBgeLG6',
        'Warehouse USA',
        NULL,
        '1',
        'saasas4',
        '',
        '1216545',
        'usa',
        '2023-09-26 05:45:33',
        '2023-09-26 05:47:08',
        -- '1',
        '3',
        NULL,
        NULL
    ),
    (
        'warehouse@gmail.com',
        '$2b$10$9RGeFkm4xGftRQRfjfojpOOvuwmQb/JsXgZDjPbpi5AnmZt/AN8Ey',
        'Warehouse pacifrica',
        NULL,
        '1',
        NULL,
        '',
        '12318413',
        'usa',
        '2023-09-26 05:45:47',
        '2023-09-26 05:45:47',
        -- '2',
        '3',
        NULL,
        NULL
    );
INSERT INTO
    `baseunits` (
        `status`,
        `deleted`,
        `createdAt`,
        `updatedAt`,
        `weightUnitId`,
        `lengthUnitId`,
        `distanceUnitId`,
        `currencyUnitId`
    )
VALUES
    (
        '1',
        '0',
        '2023-09-26 07:41:02',
        '2023-09-26 07:41:02',
        '2',
        '1',
        '3',
        '4'
    );
    -- seeders
    COMMIT;