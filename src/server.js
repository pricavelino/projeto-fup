const express = require('express')
const cors    = require('cors')
const path    = require('path')

require('./db/init')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

app.use('/api/projetos',    require('./routes/projetos'))
app.use('/api',             require('./routes/analistas'))
app.use('/api/lancamentos', require('./routes/lancamentos'))
app.use('/api',             require('./routes/marcos'))

app.use('/api/*', (req, res) => res.status(404).json({ erro: 'Rota nao encontrada' }))

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')))

const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log('FUP rodando em http://localhost:' + PORT)
  console.log('Acesso na rede: http://SEU_IP:' + PORT)
})