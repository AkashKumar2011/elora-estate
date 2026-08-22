

# EloraEstate

EloraEstate is a modern full-stack real estate rental discovery and CRM platform built for the Mumbai residential rental market.

The platform combines a professional public property-discovery website with role-based CRM workflows for clients, brokers, owners/caretakers, and administrators.

## Key Features

- Public property discovery
- Residential rental listings
- Property search and filtering
- Property details and photo gallery
- Client OTP authentication
- Broker and Owner/Caretaker accounts
- Admin approval and access control
- Role-based dashboards
- Client requirement management
- Rule-based property matching
- Client Cart / Shortlist
- Broker-managed property Lineups
- Visit scheduling and management
- Follow-up tracking
- Lead pipeline management
- Deal and commission tracking
- Client notes and activity history
- Public/private property data separation
- Responsive mobile-first interface

## User Roles

EloraEstate supports four primary roles:

1. Client
2. Agent / Broker
3. Owner / Caretaker
4. Admin

Each role receives a dedicated experience with permission-based access to relevant information and functionality.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

## Project Structure

```text
elora-estate/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
│
└── README.md
