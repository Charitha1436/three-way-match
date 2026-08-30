import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { SkuMaster } from '../models/SkuMaster';
import { connectDB } from '../config/db';

const sampleSkus = [
  { skuErpCode: '11423', eanCode: 'FG-P-F-0503', name: 'psm Cheesy Spicy Veg Momos 24.0 Pieces', hsnCode: '19022010', uom: 'PKT', agreedRate: 220.762, mrp: 305.00, priceTolerance: 0.05 },
  { skuErpCode: '11797', eanCode: 'FG-M-F-1703', name: 'Meatigo Hot Wings 250.0 g', hsnCode: '02071400', uom: 'PKT', agreedRate: 126.667, mrp: 175.00, priceTolerance: 0.05 },
  { skuErpCode: '18003', eanCode: 'FG-M-F-0620', name: 'Meatigo Chicken Curry Cut Skinless Frozen 450.0 g', hsnCode: '02071300', uom: 'PKT', agreedRate: 141.143, mrp: 195.00, priceTolerance: 0.05 },
  { skuErpCode: '18004', eanCode: 'FG-M-F-0619', name: 'Meatigo Chicken Boneless Breast Frozen 450.0 g', hsnCode: '02071300', uom: 'PKT', agreedRate: 199.048, mrp: 275.00, priceTolerance: 0.05 },
  { skuErpCode: '253430', eanCode: 'FG-P-F-0249', name: 'psm Pork Salami 200.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 188.190, mrp: 260.00, priceTolerance: 0.05 },
  { skuErpCode: '33387', eanCode: 'FG-P-F-0234', name: 'psm Frozen Chicken Chilli Salami 200.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 126.667, mrp: 175.00, priceTolerance: 0.05 },
  { skuErpCode: '33390', eanCode: 'FG-P-F-0413', name: 'psm Chicken Seekh Kebab 500.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 228.000, mrp: 315.00, priceTolerance: 0.05 },
  { skuErpCode: '398656', eanCode: 'FG-M-F-0602', name: 'Meatigo Chicken Drumsticks 450.0 g', hsnCode: '02071400', uom: 'PKT', agreedRate: 188.190, mrp: 260.00, priceTolerance: 0.05 },
  { skuErpCode: '414867', eanCode: 'FG-P-F-1707', name: 'psm Chinese Veg Spring Rolls 240.0 g', hsnCode: '20049000', uom: 'PKT', agreedRate: 119.429, mrp: 165.00, priceTolerance: 0.05 },
  { skuErpCode: '432518', eanCode: 'FG-M-F-0622', name: 'Meatigo Chicken Kheema 450.0 g', hsnCode: '02071400', uom: 'PKT', agreedRate: 199.048, mrp: 275.00, priceTolerance: 0.05 },
  { skuErpCode: '4459', eanCode: 'FG-P-F-0505', name: 'psm Original Chicken Momos 24.0 Pieces', hsnCode: '21069099', uom: 'PKT', agreedRate: 220.762, mrp: 305.00, priceTolerance: 0.05 },
  { skuErpCode: '4460', eanCode: 'FG-PF--0512', name: 'psm Spicy Chicken Momos 24.0 Pieces', hsnCode: '21069099', uom: 'PKT', agreedRate: 220.762, mrp: 305.00, priceTolerance: 0.05 },
  { skuErpCode: '4461', eanCode: 'FG-P-F-0514', name: 'psm Veg & Paneer Momos 24.0 Pieces', hsnCode: '21069099', uom: 'PKT', agreedRate: 202.667, mrp: 280.00, priceTolerance: 0.05 },
  { skuErpCode: '453259', eanCode: 'FG-P-F-0335', name: 'psm Chicken Cheese & Onion Sausage 250.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 144.762, mrp: 200.00, priceTolerance: 0.05 },
  { skuErpCode: '4694', eanCode: 'FG-P-F0504-', name: 'psm Original Chicken Momos 10.0 Pieces', hsnCode: '21069099', uom: 'PKT', agreedRate: 133.905, mrp: 185.00, priceTolerance: 0.05 },
  { skuErpCode: '4697', eanCode: 'FG-PF--0513', name: 'psm Veg & Paneer Momos 10.0 Pieces', hsnCode: '21069099', uom: 'PKT', agreedRate: 112.190, mrp: 155.00, priceTolerance: 0.05 },
  { skuErpCode: '469735', eanCode: 'FG-MF--1728', name: 'Meatigo Everyday Chicken Breast (Frozen) 150.0 g', hsnCode: '16021000', uom: 'PKT', agreedRate: 119.429, mrp: 165.00, priceTolerance: 0.05 },
  { skuErpCode: '4699', eanCode: 'FG-P-F-0323', name: 'psm Pork Sausage 250.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 170.095, mrp: 235.00, priceTolerance: 0.05 },
  { skuErpCode: '4700', eanCode: 'FG-P-F-0236', name: 'psm Pork Ham 200.0 g', hsnCode: '16024900', uom: 'PKT', agreedRate: 177.333, mrp: 245.00, priceTolerance: 0.05 },
  { skuErpCode: '470663', eanCode: 'FG-P-F-0580', name: 'psm Whole Wheat Momos - Veg & Paneer 330.0 g', hsnCode: '16021000', uom: 'PKT', agreedRate: 162.857, mrp: 225.00, priceTolerance: 0.05 },
  { skuErpCode: '49168', eanCode: 'FG-P-F-0527', name: 'psm Peri Peri Veg Momos 15.0 Pieces', hsnCode: '19022010', uom: 'PKT', agreedRate: 88.667, mrp: 245.00, priceTolerance: 0.05 },
  { skuErpCode: '498695', eanCode: 'FG-P-F-0247', name: 'psm Chicken Salami 200.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 137.524, mrp: 190.00, priceTolerance: 0.05 },
  { skuErpCode: '507809', eanCode: 'FG-P-F-1911', name: 'psm Pizza Minis-Chicken Tikka 180.0 g', hsnCode: '19059090', uom: 'PKT', agreedRate: 115.086, mrp: 159.00, priceTolerance: 0.05 },
  { skuErpCode: '598770', eanCode: 'FG-P-F-0102', name: 'psm Pork Breakfast Bacon 150.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 152.000, mrp: 210.00, priceTolerance: 0.05 },
  { skuErpCode: '6664', eanCode: 'FG-P-F-0321', name: 'psm Chicken Sausages 250.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 130.286, mrp: 180.00, priceTolerance: 0.05 },
  { skuErpCode: '730016', eanCode: 'FG-P-F-0581', name: 'psm Whole Wheat Chicken Momos 330.0 g', hsnCode: '16021000', uom: 'PKT', agreedRate: 170.095, mrp: 235.00, priceTolerance: 0.05 },
  { skuErpCode: '750414', eanCode: 'FG-P-F-0501', name: 'psm Super Saver Chicken Momo Pack 1.0 kg', hsnCode: '19022010', uom: 'KG', agreedRate: 247.619, mrp: 650.00, priceTolerance: 0.05 },
  { skuErpCode: '755774', eanCode: 'FG-P-F-0564', name: 'psm Chicken & Cheese Momos 540.0 g', hsnCode: '16021000', uom: 'PKT', agreedRate: 238.857, mrp: 330.00, priceTolerance: 0.05 },
  { skuErpCode: '790919', eanCode: 'FG-M-F-1729', name: 'Meatigo Everyday Fish Fillet 200.0 g', hsnCode: '16042000', uom: 'PKT', agreedRate: 188.190, mrp: 260.00, priceTolerance: 0.05 },
  { skuErpCode: '81521', eanCode: 'FG-P-F-0542', name: 'psm Peri Peri Chicken Momos 250.0 g', hsnCode: '19022010', uom: 'PKT', agreedRate: 72.019, mrp: 199.00, priceTolerance: 0.05 },
  { skuErpCode: '205950', eanCode: 'FG-P-F-0237', name: 'psm Frozen Pork Pepperoni Salami 100.0 g', hsnCode: '16010000', uom: 'PKT', agreedRate: 133.905, mrp: 185.00, priceTolerance: 0.05 }
];

async function seed() {
  await connectDB();
  console.log('Clearing existing SKU Master entries...');
  await SkuMaster.deleteMany({});
  console.log('Inserting sample SKUs...');
  await SkuMaster.insertMany(sampleSkus);
  console.log('Database seeded successfully with ' + sampleSkus.length + ' SKUs.');
  process.exit(0);
}

seed();
