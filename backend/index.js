
const express = require("express")
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://prasadsontakke731:LmOXLragDDvbGiZM@cluster0.gcqb4uf.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const orderSchema = new mongoose.Schema({
    customerName: String,
    items: [{
        name: String,
        quantity: Number,
        price: Number,
    }],
    totalAmount: Number,
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Endpoint to create an order
app.post('/api/orders', async (req, res) => {
    const order = new Order(req.body);
    await order.save();
    res.status(201).send(order);
});



// Endpoint to generate invoice
app.get('/api/orders/:id/invoice', async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).send('Order not found');
    }

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, 'invoices', `${order.id}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Customer Name: ${order.customerName}`);
    doc.text(`Date: ${order.date}`);
    doc.text(`Total Amount: $${order.totalAmount}`);
    doc.moveDown();
    doc.text('Items:');
    order.items.forEach(item => {
        doc.text(`- ${item.name}: ${item.quantity} x $${item.price}`);
    });
    doc.end();

    doc.on('finish', () => {
        res.download(filePath);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));