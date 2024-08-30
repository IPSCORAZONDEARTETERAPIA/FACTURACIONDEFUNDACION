// Variables Globales
let currentProductId = null;

// Función de Login
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('login-message');
    
    if ((username === 'admin' && password === '221099') || (username === 'psicologa' && password === '2210')) {
        localStorage.setItem('loggedIn', true);
        localStorage.setItem('role', username);
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-content').classList.remove('hidden');
        if (username === 'psicologa') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }
        initializeProducts();
        displayInvoices();
    } else {
        message.textContent = 'Credenciales incorrectas';
    }
}

// Función de Logout
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('role');
    window.location.reload();
}

// Mostrar sección
function showSection(sectionId) {
    document.querySelectorAll('#content > section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
}

// Crear Producto
function createProduct() {
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    
    if (name && !isNaN(price)) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        products.push({ id: Date.now(), name, price });
        localStorage.setItem('products', JSON.stringify(products));
        updateProductTable();
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
    }
}

// Actualizar Producto
function updateProduct() {
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    
    if (name && !isNaN(price) && currentProductId) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const productIndex = products.findIndex(p => p.id === currentProductId);
        if (productIndex !== -1) {
            products[productIndex] = { id: currentProductId, name, price };
            localStorage.setItem('products', JSON.stringify(products));
            updateProductTable();
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            currentProductId = null;
            document.getElementById('create-product-button').style.display = 'block';
            document.getElementById('edit-product-button').style.display = 'none';
        }
    }
}

// Eliminar Producto
function deleteProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const updatedProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    updateProductTable();
}

// Editar Producto
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        currentProductId = productId;
        document.getElementById('create-product-button').style.display = 'none';
        document.getElementById('edit-product-button').style.display = 'block';
    }
}

// Actualizar la tabla de productos
function updateProductTable() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productTableBody = document.querySelector('#product-list tbody');
    productTableBody.innerHTML = '';
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.price.toFixed(2)}</td>
            <td>
                <button onclick="editProduct(${product.id})">Editar</button>
                <button onclick="deleteProduct(${product.id})">Eliminar</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
    updateProductSelect();
}

// Actualizar el menú desplegable de productos
function updateProductSelect() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const productSelect = document.getElementById('product-select');
    productSelect.innerHTML = '<option value="" disabled selected>Selecciona un Producto</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
        productSelect.appendChild(option);
    });
}

// Generar Factura
function generateInvoice() {
    const clientName = document.getElementById('client-name').value;
    const clientId = document.getElementById('client-id').value;
    const age = document.getElementById('client-age').value;
    const paymentDate = document.getElementById('payment-date').value;
    const paymentMethod = document.getElementById('payment-method').value;
    const observations = document.getElementById('observations').value;
    const productId = parseInt(document.getElementById('product-select').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    if (clientName && clientId && age && paymentDate && paymentMethod && productId && quantity) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === productId);
        if (product) {
            const invoice = {
                clientName,
                clientId,
                age,
                paymentDate,
                paymentMethod,
                observations,
                products: [{
                    name: product.name,
                    quantity,
                    price: product.price,
                    total: product.price * quantity
                }],
                total: product.price * quantity
            };
            
            const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
            invoices.push(invoice);
            localStorage.setItem('invoices', JSON.stringify(invoices));
            displayInvoices();
        }
    }
}

// Mostrar Facturas
function displayInvoices() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoiceTableBody = document.querySelector('#invoice-table tbody');
    invoiceTableBody.innerHTML = '';
    invoices.forEach((invoice, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.clientName}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td>
                <button onclick="printInvoice(${index})">Imprimir</button>
                <button onclick="deleteInvoice(${index})">Eliminar</button>
            </td>
        `;
        invoiceTableBody.appendChild(row);
    });
}

// Imprimir Factura
function printInvoice(index) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const invoice = invoices[index];
    if (invoice) {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Factura</title>');
        printWindow.document.write('<style>@page { margin: 20mm; } body { font-family: Arial, sans-serif; } .invoice { margin: 20px; } .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; } .content { margin: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #4CAF50; color: white; } </style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<div class="invoice">');
        printWindow.document.write('<div class="header">FUNDACIÓN CORAZÓN DE ARTE TERAPIA</div>');
        printWindow.document.write('<div class="content">');
        printWindow.document.write('<h2>Factura</h2>');
        printWindow.document.write(`<p>Cliente: ${invoice.clientName}</p>`);
        printWindow.document.write(`<p>ID Cliente: ${invoice.clientId}</p>`);
        printWindow.document.write(`<p>Edad: ${invoice.age}</p>`);
        printWindow.document.write(`<p>Fecha de Pago: ${invoice.paymentDate}</p>`);
        printWindow.document.write(`<p>Metodo de Pago: ${invoice.paymentMethod}</p>`);
        printWindow.document.write(`<p>Observaciones: ${invoice.observations}</p>`);
        printWindow.document.write('<h3>Productos</h3>');
        printWindow.document.write('<table>');
        printWindow.document.write('<tr><th>Nombre</th><th>Cantidad</th><th>Precio Unitario</th><th>Total</th></tr>');
        invoice.products.forEach(product => {
            printWindow.document.write(`<tr><td>${product.name}</td><td>${product.quantity}</td><td>$${product.price.toFixed(2)}</td><td>$${product.total.toFixed(2)}</td></tr>`);
        });
        printWindow.document.write('</table>');
        printWindow.document.write(`<h3>Total Factura: $${invoice.total.toFixed(2)}</h3>`);
        printWindow.document.write('</div>');
        
        // Agregar frase motivadora
        printWindow.document.write('<div style="margin-top: 20px; text-align: center; font-style: italic;">');
        printWindow.document.write('<p><strong>¡Gracias por tu confianza en nosotros!</strong></p>');
        printWindow.document.write('<p>Recuerda: "El éxito es la suma de pequeños esfuerzos repetidos día tras día."</p>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}

// Eliminar Factura
function deleteInvoice(index) {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.splice(index, 1);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    displayInvoices();
}

// Inicializar Productos
function initializeProducts() {
    updateProductTable();
}

// Ejecutar en el Cargado de la Página
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('loggedIn')) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('main-content').classList.remove('hidden');
        if (localStorage.getItem('role') === 'psicologa') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        }
        initializeProducts();
        displayInvoices();
    }
});
