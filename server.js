const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Global error handlers to capture crashes and promise rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
    // don't exit: keep process alive for debugging; consider restarting via supervisor in production
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // don't exit: log and continue
});
process.on('exit', (code) => {
    console.log('Process exiting with code:', code);
});

// Keep-alive safeguard: if no other handles keep the event loop alive (rare with HTTP server),
// this interval will keep the process running. It's safe and low-overhead.
const keepAlive = setInterval(() => {}, 1 << 30);

// Handle termination signals gracefully
process.on('SIGINT', () => {
    console.log('SIGINT received — shutting down gracefully');
    clearInterval(keepAlive);
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    clearInterval(keepAlive);
    process.exit(0);
});
const movimentacoesRouter = require('./routes/movimentacoes');
app.use('/movimentacoes', movimentacoesRouter);


const produtosRouter = require('./routes/produtos');
app.use(produtosRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});