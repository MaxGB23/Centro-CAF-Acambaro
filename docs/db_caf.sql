-- ============================================
-- 1. CLIENTES
-- ============================================
-- Se requiere un panel de administracion para gestionar
-- clientes del centro caf (fisioterapia y rehabilitacion),
-- con sus datos personales y patologías, la landing page agenda
-- citas mediante cal.com, todas presenciales y el pago de igual manera presencial
-- se requiere 
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    edad INT,
    telefono VARCHAR(20),
    email VARCHAR(150),
    estatus ENUM('activo', 'inactivo', 'alta') DEFAULT 'inactivo',
    patologia_id INT,
    paquete_id INT,
    estatus_pago ENUM('pendiente', 'pagado') DEFAULT 'pendiente',
    pago DECIMAL(10,2),
    FOREIGN KEY (patologia_id) REFERENCES patologias(id),
    FOREIGN KEY (paquete_id) REFERENCES paquetes(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ============================================
-- 2. PATOLOGÍAS
-- ============================================
CREATE TABLE pathologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- Relación N:M clientes ↔ patologías
CREATE TABLE client_pathologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    pathology_id INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (pathology_id) REFERENCES pathologies(id)
);

-- ============================================
-- 3. PAQUETES
-- ============================================
CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    total_sessions INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT
);

-- ============================================
-- 4. PAQUETES POR CLIENTE
-- (Historial de compras de paquetes)
-- ============================================
CREATE TABLE client_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    package_id INT NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    status ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- ============================================
-- 5. PAGOS
-- ============================================
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_package_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    method ENUM('efectivo', 'transferencia', 'tarjeta', 'otro') NOT NULL,
    type ENUM('pago', 'adelanto', 'ajuste') DEFAULT 'pago',
    notes TEXT,
    FOREIGN KEY (client_package_id) REFERENCES client_packages(id)
);

-- ============================================
-- 6. ASISTENCIAS
-- ============================================
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_package_id INT NOT NULL,
    session_date DATETIME NOT NULL,
    assisted BOOLEAN DEFAULT TRUE,
    notes TEXT,
    FOREIGN KEY (client_package_id) REFERENCES client_packages(id)
);

-- ============================================
-- 7. CITAS INTERNAS (sincronización con Cal.com)
-- ============================================
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    calcom_booking_id VARCHAR(255),  -- UID de Cal.com si existe
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('pendiente', 'confirmada', 'cancelada', 'asistida') DEFAULT 'pendiente',
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ============================================
-- 8. WEBHOOK EVENTS (para evitar duplicados)
-- ============================================
CREATE TABLE webhook_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE,
    event_type VARCHAR(255),
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
