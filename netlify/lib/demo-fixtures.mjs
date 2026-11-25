// Synthetic examples only; not production records.\nexport const demoFixtures = {
  "version": 1,
  "label": "Información ficticia de demostración",
  "asada": {
    "name": "ASADA Ejemplo",
    "services": 350
  },
  "finance": {
    "currency": "CRC",
    "years": [
      {
        "year": 2024,
        "income": 42000000,
        "expenses": 31000000
      },
      {
        "year": 2025,
        "income": 45500000,
        "expenses": 33500000
      },
      {
        "year": 2026,
        "income": 48000000,
        "expenses": 35000000
      }
    ]
  },
  "sources": [
    {
      "name": "Naciente Ejemplo Norte",
      "flows": [
        3.2,
        3.1,
        2.9,
        2.6,
        2.8,
        3.4,
        3.8,
        3.9,
        4,
        4.1,
        3.8,
        3.5
      ]
    },
    {
      "name": "Naciente Ejemplo Sur",
      "flows": [
        2.1,
        2,
        1.8,
        1.6,
        1.8,
        2.2,
        2.4,
        2.5,
        2.6,
        2.7,
        2.5,
        2.3
      ]
    },
    {
      "name": "Naciente Ejemplo Este",
      "flows": [
        1.4,
        1.3,
        1.2,
        1.1,
        1.2,
        1.5,
        1.6,
        1.7,
        1.8,
        1.8,
        1.7,
        1.5
      ]
    }
  ],
  "suppliers": [
    {
      "name": "Proveedor ficticio de tuberías",
      "category": "Materiales"
    },
    {
      "name": "Proveedor ficticio de medición",
      "category": "Equipos"
    },
    {
      "name": "Proveedor ficticio de laboratorio",
      "category": "Servicios"
    }
  ],
  "materials": [
    {
      "name": "Tubería PVC 50 mm",
      "unit": "m",
      "stock": 120,
      "min": 40
    },
    {
      "name": "Medidor ½ pulgada",
      "unit": "unidad",
      "stock": 25,
      "min": 10
    },
    {
      "name": "Válvula 50 mm",
      "unit": "unidad",
      "stock": 8,
      "min": 3
    },
    {
      "name": "Cloro",
      "unit": "kg",
      "stock": 20,
      "min": 5
    }
  ],
  "arrears": [
    {
      "subscriber": "DEMO-001",
      "amount": 7500,
      "daysOverdue": 30
    },
    {
      "subscriber": "DEMO-002",
      "amount": 8750,
      "daysOverdue": 45
    },
    {
      "subscriber": "DEMO-003",
      "amount": 10000,
      "daysOverdue": 60
    },
    {
      "subscriber": "DEMO-004",
      "amount": 11250,
      "daysOverdue": 75
    },
    {
      "subscriber": "DEMO-005",
      "amount": 12500,
      "daysOverdue": 30
    },
    {
      "subscriber": "DEMO-006",
      "amount": 13750,
      "daysOverdue": 45
    },
    {
      "subscriber": "DEMO-007",
      "amount": 15000,
      "daysOverdue": 60
    },
    {
      "subscriber": "DEMO-008",
      "amount": 16250,
      "daysOverdue": 75
    },
    {
      "subscriber": "DEMO-009",
      "amount": 17500,
      "daysOverdue": 30
    },
    {
      "subscriber": "DEMO-010",
      "amount": 18750,
      "daysOverdue": 45
    },
    {
      "subscriber": "DEMO-011",
      "amount": 20000,
      "daysOverdue": 60
    },
    {
      "subscriber": "DEMO-012",
      "amount": 21250,
      "daysOverdue": 75
    }
  ],
  "documents": [
    {
      "title": "Oficio ficticio de solicitud de materiales",
      "type": "oficio",
      "body": "Documento de demostración. Se solicita cotización de tuberías y válvulas para mantenimiento preventivo."
    },
    {
      "title": "Informe ficticio de aforos",
      "type": "informe",
      "body": "Documento de demostración. Se presentan mediciones ilustrativas de tres nacientes."
    }
  ]
};\n