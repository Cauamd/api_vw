const express = require('express');
const db = require('../db');

const router = express.Router();


router.get('/teste', (req, res) => {
    res.send('OK');
});


router.get('/relatorio-periodo', async (req, res) => {

    const { dataInicial, dataFinal } = req.query;

    const sql = `
        SELECT
            p.nome AS nome_produto,
            p.unidade_medida AS unidade_medida,

            SUM(
                CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade ELSE 0 END
            ) AS total_entradas,

            SUM(
                CASE WHEN m.tipo = 'SAIDA' THEN m.quantidade ELSE 0 END
            ) AS total_saidas,

            SUM(
                CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade ELSE 0 END
            ) -
            SUM(
                CASE WHEN m.tipo = 'SAIDA' THEN m.quantidade ELSE 0 END
            ) AS saldo_periodo,

            SUM(
                CASE WHEN m.tipo = 'ENTRADA' THEN m.quantidade * p.valor ELSE 0 END
            ) AS valor_total_entradas,

            SUM(
                CASE WHEN m.tipo = 'SAIDA' THEN m.quantidade * p.valor ELSE 0 END
            ) AS valor_total_saidas

        FROM produtos p
        INNER JOIN movimentacao m
            ON p.id = m.produtos_id

        WHERE m.data BETWEEN ? AND ?

        GROUP BY
            p.id,
            p.nome,
            p.unidade_medida
    `;

    try {
        const [rows] = await db.query(sql, [dataInicial, dataFinal]);
        return res.json(rows);
    } catch (erro) {
        console.error('Erro ao gerar relatório por período:', erro);
        return res.status(500).json({ erro: erro.message });
    }
});



// GET /movimentacoes/maior-saida?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD[&limit=N]
router.get('/maior-saida', async (req, res) => {
    const { dataInicial, dataFinal, limit } = req.query;

    if (!dataInicial || !dataFinal) {
        return res.status(400).json({ error: 'Parâmetros dataInicial e dataFinal são obrigatórios' });
    }

    let sql = `
        SELECT
            p.nome AS nome_produto,
            SUM(m.quantidade) AS quantidade_total_saida,
            SUM(m.quantidade * p.valor) AS valor_total_saidas
        FROM movimentacao m
        INNER JOIN produtos p ON p.id = m.produtos_id
        WHERE m.tipo = 'SAIDA' AND m.data BETWEEN ? AND ?
        GROUP BY p.id, p.nome
        ORDER BY quantidade_total_saida DESC
    `;

    const params = [dataInicial, dataFinal];
    if (limit && Number(limit) > 0) {
        sql += ' LIMIT ?';
        params.push(Number(limit));
    }

    try {
        const [rows] = await db.query(sql, params);
        return res.json(rows);
    } catch (err) {
        console.error('Erro ao listar maior saída:', err);
        return res.status(500).json({ error: 'Erro ao listar maior saída' });
    }
});


module.exports = router;