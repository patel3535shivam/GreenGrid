# GreenGrid – Smart Energy Management System

GreenGrid is a full-stack Smart Energy Management System (EMIS) designed to monitor, analyze, and optimize energy consumption across multiple facilities.

The system provides centralized energy monitoring, facility management, renewable energy tracking, utility billing, analytics, forecasting, alerts, reporting, and administration through a modern web-based platform.

---

## 🚀 Key Features

- 🔐 JWT-based authentication and protected application routes
- 🏢 Multi-facility energy management
- ⚡ Smart meter and energy telemetry monitoring
- 📊 Real-time energy consumption dashboard
- 📈 Energy analytics and consumption trends
- 🔮 Energy demand forecasting
- ☀️ Solar PV and renewable energy monitoring
- 🔋 Battery Energy Storage System (BESS) monitoring
- 💰 Utility billing and tariff management
- 🚨 Energy alerts and incident monitoring
- 📄 CSV-based reporting and data export
- ⚙️ User, organization, and system administration
- 🌐 Public enterprise landing page
- 📱 Responsive modern dashboard interface

---

## 🏗️ System Architecture

GreenGrid follows a three-tier architecture:

```text
┌─────────────────────────────────────┐
│          PRESENTATION TIER          │
│                                     │
│   React.js + Tailwind CSS +        │
│   Recharts + Axios + React Router  │
└──────────────────┬──────────────────┘
                   │
                   │ REST API / JSON
                   ▼
┌─────────────────────────────────────┐
│          APPLICATION TIER           │
│                                     │
│   Python + Django + DRF            │
│   JWT Authentication               │
│   APScheduler + Business Logic     │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│            DATA TIER                │
│                                     │
│   SQLite (Development)             │
│   MySQL (Production Option)        │
└─────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Recharts
- Axios
- React Router
- Lucide React

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- APScheduler

### Data Analytics

- Pandas
- NumPy
- Scikit-learn

### Database

- SQLite for local development
- MySQL support for production deployment

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman

---

## 📂 Project Structure

```text
GreenGrid/
│
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── facilities/
│   │   ├── energy/
│   │   ├── billing/
│   │   ├── renewable/
│   │   ├── analytics/
│   │   ├── forecast/
│   │   ├── alerts/
│   │   └── reports/
│   │
│   ├── greengrid/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── router/
│
├── design-reference/
│   └── GreenGrid UI reference screens
│
├── GreenGrid_Project_Report.docx
├── GreenGrid_Project_Report.pdf
└── .gitignore
```

---

## 🖥️ Main Modules

### 1. Authentication

GreenGrid uses JWT-based authentication for secure access to protected application features.

The application separates the public landing page from authenticated energy-management modules.

### 2. Executive Dashboard

The dashboard provides an overview of:

- Total energy consumption
- Current power demand
- Peak demand
- Energy cost
- Renewable energy contribution
- Facility-wise consumption
- Live telemetry status

### 3. Facilities Management

The Facilities module manages multiple campus facilities and their connected smart meters.

It provides facility-level information such as:

- Facility details
- Connected load
- Meter status
- Current consumption
- Energy usage

### 4. Energy Monitoring

The Energy Monitoring module provides:

- Energy telemetry
- Current demand
- Historical consumption
- Peak demand
- Power factor information
- Load profiles
- Telemetry refresh

The application uses simulated smart-meter readings for development and demonstration.

### 5. Renewable Energy

The Renewable Energy module provides visibility into:

- Solar PV generation
- Renewable energy share
- Battery Energy Storage System (BESS)
- Grid interaction
- Energy generation trends
- Carbon savings

### 6. Utility Billing

The Billing module provides:

- Energy consumption summary
- Utility billing information
- Tariff configuration
- Energy charges
- Fixed charges
- Renewable energy credits
- CSV export

### 7. Analytics

The Analytics module provides energy-management insights including:

- Energy consumption trends
- Facility consumption comparison
- Peak demand analysis
- Power factor information
- Energy cost analysis

### 8. Forecasting

The Forecast module provides predictive energy analysis using available historical telemetry data.

It supports configurable forecast horizons and provides:

- Forecast consumption
- Average daily consumption
- Predicted peak demand
- Forecast confidence
- Historical vs forecast visualization
- Facility-wise forecast information

### 9. Alerts

The Alerts module provides centralized monitoring of energy-related incidents.

It supports:

- Critical alerts
- Warning alerts
- Active/unresolved alerts
- Resolved alerts
- Alert filtering
- Incident inspection

### 10. Reports

The Reports module provides energy-management reporting and export capabilities.

It includes:

- Consumption summaries
- Cost information
- Peak demand information
- Solar generation information
- Telemetry coverage
- CSV report generation
- Report archive

### 11. Settings & Administration

The Settings module provides:

- Profile settings
- Organization settings
- Security and password management
- User and role management
- System configuration

### 12. Public Landing Page

GreenGrid includes a public enterprise landing page presenting the platform's:

- Smart energy management capabilities
- Real-time metrology concept
- Renewable energy integration
- Predictive energy analytics
- Automated utility billing
- Multi-facility management

---

## ⚡ Telemetry Simulation

For development and demonstration purposes, GreenGrid uses simulated smart-meter telemetry.

The backend scheduler periodically generates energy readings and updates the energy data used by the dashboard and monitoring modules.

This allows the complete energy-monitoring workflow to be demonstrated without requiring physical smart meters or IoT gateways.

> Physical IoT hardware and real smart-meter integration are considered future scope.

---

## 🔐 Authentication

GreenGrid uses JWT-based authentication for protected application routes.

The application architecture separates:

- Public landing page
- Authentication
- Protected energy-management modules

Production credentials and secrets should be stored using environment variables and should not be committed to the repository.

---

## 💻 Local Development Setup

### Prerequisites

Make sure the following are installed:

- Python 3.x
- Node.js and npm
- Git

---

### Backend Setup

Open a terminal in the project directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver 8000
```

Backend:

```text
http://localhost:8000
```

---

### Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🧪 Testing

The project can be tested locally by verifying:

- Authentication
- Dashboard
- Facilities
- Energy Monitoring
- Renewable Energy
- Billing
- Analytics
- Forecast
- Alerts
- Reports
- Settings
- Public Landing Page

The frontend production build can be generated using:

```bash
npm run build
```

The Django backend can be checked using:

```bash
python manage.py check
```

---

## 📊 Project Modules Overview

| Module | Purpose |
|---|---|
| Authentication | Secure user access and JWT authentication |
| Facilities | Multi-facility and smart-meter management |
| Energy Monitoring | Telemetry and energy consumption monitoring |
| Renewable Energy | Solar PV and BESS monitoring |
| Billing | Utility consumption and billing |
| Analytics | Energy and power-quality analysis |
| Forecast | Predictive demand and consumption analysis |
| Alerts | Energy incidents and anomaly monitoring |
| Reports | Reporting and CSV export |
| Settings | System and user administration |
| Landing Page | Public enterprise showcase |

---

## 🔮 Future Scope

GreenGrid can be extended with:

- Real smart-meter integration
- IoT edge gateways
- Modbus/RS-485 communication
- ESP32 and Raspberry Pi based edge devices
- PostgreSQL or TimescaleDB
- Advanced machine-learning forecasting
- Deep-learning models such as LSTM
- Real-time WebSocket communication
- Push notifications
- Mobile application using React Native
- Automated payment integration
- Cloud deployment
- Scalable distributed infrastructure

---

## 🌱 Sustainability

GreenGrid focuses on smarter energy utilization and renewable-energy visibility.

The platform helps organizations:

- Understand energy consumption patterns
- Monitor facility-level energy usage
- Track renewable energy generation
- Identify abnormal energy conditions
- Analyze energy costs
- Support data-driven energy-management decisions

The project is aligned with sustainability objectives related to clean energy and efficient resource utilization.

---

## 📄 Project Documentation

Complete project documentation is included in this repository:

- `GreenGrid_Project_Report.pdf`
- `GreenGrid_Project_Report.docx`

The report contains the project background, requirements, architecture, implementation details, module descriptions, interface screenshots, testing, limitations, and future scope.

---

## 👨‍💻 Developer

**Shivam Kumar Patel**

B.Tech – Computer Science & Engineering  
ABES Engineering College, Ghaziabad  
Academic Session: 2025–2026

---

## 🎯 Project Objective

The primary objective of GreenGrid is to develop a centralized Smart Energy Management System that combines energy monitoring, facility management, renewable-energy tracking, utility billing, analytics, forecasting, alerts, and reporting into a unified platform.

The system is designed to demonstrate how software-based energy intelligence can help organizations monitor consumption, understand energy patterns, and make informed energy-management decisions.

---

## 📌 Project Status

**Development Version – Completed**

The repository contains the current GreenGrid application source code, frontend implementation, backend implementation, design references, and project documentation.

---

## 📜 License

This project was developed as an academic project for educational and demonstration purposes.

---

**GreenGrid – Smart Energy Management System**
