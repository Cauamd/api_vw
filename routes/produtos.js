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
    const { nome, valor, quantidade, categoria } = req.body;


    try {
        const [result] = await db.query('INSERT INTO produtos (nome, valor, quantidade, categoria) VALUES (?, ?, ?, ?)', [nome, valor, quantidade, categoria]);
        res.status(201).json({ id: result.insertId, nome, valor, quantidade, categoria });
    }
    catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

router.get('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM produtos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }   
});

router.get('/produtos-categoria/:categoria', async (req, res) => {
    const { categoria } = req.params;
    const sql = `
        SELECT
            categoria,
            SUM(valor * quantidade) AS valor_total
        FROM produtos
        WHERE categoria = ?
        GROUP BY categoria
    `;

    try {
        const [rows] = await db.query(sql, [categoria]);
        return res.status(200).json(rows);
    } catch (erro) {
        console.error('Erro ao agregar por categoria:', erro);
        return res.status(500).json({ erro: erro.message });
    }
});

router.get('/saidas', async (req, res) => {
    const sql = `
        SELECT
            m.id,
            m.data,
            m.quantidade,
            p.nome AS produto,
            p.categoria
        FROM movimentacao m
        INNER JOIN produtos p
            ON m.produtos_id = p.id
        WHERE m.tipo = 'SAIDA'
        ORDER BY m.data DESC
    `;
    try {
        const [rows] = await db.query(sql);
        return res.status(200).json(rows);
    } catch (erro) {
        console.error('Erro ao buscar saídas:', erro);
        return res.status(500).json({ erro: erro.message });
    }
});

router.get('/produtos/limites', async (req, res) => {
       const sql = `
        SELECT
            id,
            nome,
            quantidade,
            ROUND((quantidade / 100) * 100, 2) AS percentual,
            CASE
                WHEN quantidade = 0 THEN 'ESTOQUE MINIMO'
                WHEN quantidade = 100 THEN 'ESTOQUE MAXIMO'
            END AS situacao
        FROM produtos
        WHERE quantidade = 0
           OR quantidade = 100
    `;

    db.query(sql, (erro, resultado) => {
        if (erro) {
            return res.status(500).json({
                erro: erro.message
            });
        }

        res.status(200).json(resultado);
    });
});



module.exports = router;