const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/produtos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

router.post('/produtos', async (req, res) => {
    const { nome } = req.body;
    const valor = req.body.preco ?? req.body.valor;
    try {
        const [result] = await db.query('INSERT INTO produtos (nome, valor, quantidade, categoria) VALUES (?, ?, ?, ?)', [nome, valor, req.body.quantidade, req.body.categoria]);
        res.status(201).json({ id: result.insertId, nome, valor, quantidade: req.body.quantidade, categoria: req.body.categoria });
    }
    catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto', details: error.message });
    }
});

module.exports = router;