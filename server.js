const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dummy Database de Produtos
const products = [
  { 
    id: 1, 
    name: 'Aura Headphone Pro', 
    price: 1499.00, 
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', 
    category: 'Áudio', 
    description: 'Som imersivo com cancelamento de ruído ativo e design premium.' 
  },
  { 
    id: 2, 
    name: 'Nebula Smartwatch X', 
    price: 2199.00, 
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', 
    category: 'Wearables', 
    description: 'Monitore sua saúde com estilo. Tela OLED vibrante e bateria de 7 dias.' 
  },
  { 
    id: 3, 
    name: 'Teclado Mecânico Nova Max', 
    price: 850.00, 
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop', 
    category: 'Acessórios', 
    description: 'A perfeição mecânica para desenvolvedores e gamers. Switches tácteis silenciosos.' 
  },
  { 
    id: 4, 
    name: 'Zenith Mouse Wireless', 
    price: 499.00, 
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop', 
    category: 'Acessórios', 
    description: 'Precisão absoluta sem fios com design ergonômico feito para o conforto.' 
  },
  { 
    id: 5, 
    name: 'Monitor UltraWide Prism 34"', 
    price: 3499.00, 
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop', 
    category: 'Monitores', 
    description: 'Aumente sua produtividade com uma tela incrivelmente ampla e cores fiéis.' 
  },
  { 
    id: 6, 
    name: 'Câmera Lumina 4K', 
    price: 1899.00, 
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', 
    category: 'Câmeras', 
    description: 'Capture detalhes incríveis com resolução 4K. Ideal para streaming e vídeos.' 
  }
];

// Rota para listar produtos
app.get('/api/produtos', (req, res) => {
  res.json(products);
});

// Rota de Checkout
app.post('/api/checkout', (req, res) => {
  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'O carrinho está vazio.' });
  }
  
  // Calcula o total da compra
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Simula o processamento do pagamento
  res.json({ 
    message: 'Compra realizada com sucesso!', 
    orderId: Math.floor(Math.random() * 1000000),
    total: total
  });
});

// Serve o frontend para qualquer outra rota (SPA fallback)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
