---
meta.contentType: Reference
---

# Documentation suite

Play! South Wales organizes technical documentation using the Diátaxis authoring framework. This framework separates content into four distinct quadrants based on user needs and goals.

```
                   Practical               Theoretical
             +-----------------------+-----------------------+
             |                       |                       |
  Learning   |       TUTORIALS       |     EXPLANATION       |
             |   Learning-oriented   |  Understanding-focus  |
             |                       |                       |
             +-----------------------+-----------------------+
             |                       |                       |
  Working    |     HOW-TO GUIDES     |       REFERENCE       |
             |   Problem-oriented    |  Information-oriented |
             |                       |                       |
             +-----------------------+-----------------------+
```

## Documentation matrix

| Quadrant | Document | Audience | Focus |
| :--- | :--- | :--- | :--- |
| **Tutorial** | [SETUP.md](SETUP.md) | New contributors | Practical lesson to run all services locally from scratch |
| **Explanation** | [architecture.md](architecture.md) | System architects, developers | Discussion of system topology, virtual IDs, and design decisions |
| **Reference** | [api.md](api.md) | API consumers, integrators | Complete catalog of FastAPI and Discord bot HTTP endpoints |
| **How-to Guide** | [backend_developer_guide.md](backend_developer_guide.md) | Backend developers | Recipes to add endpoints, Pydantic models, and database services |
| **How-to Guide** | [frontend_developer_guide.md](frontend_developer_guide.md) | Frontend developers | Recipes to build routes, query data, and apply design system tokens |
| **How-to Guide** | [bot_guide.md](bot_guide.md) | Bot developers | Recipes to configure commands, handle events, and post notifications |
| **How-to Guide** | [event_sync.md](event_sync.md) | System operators | Recipes to trigger scrapers, exclude dates, and run migrations |

## Choosing the right document

- If you are new to the repository, start with the tutorial in [SETUP.md](SETUP.md).
- If you need to complete a specific task, consult the relevant how-to guide.
- If you need exact payload shapes, status codes, or parameters, consult [api.md](api.md).
- If you want to understand how subsystems interact and why they are designed this way, read [architecture.md](architecture.md).

