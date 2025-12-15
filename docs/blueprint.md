# **App Name**: Librarian's Toolkit

## Core Features:

- Master Catalog: Centralized book catalog with code and name fields, supporting add, edit, delete, search, filter, and sort operations.  The code must be unique.
- Inventory Management: Module to view and organize available books with code and name fields. Supports add, delete, edit, and quick search.
- Sales Recording: Record book sales with date (default to today or manual selection), and status options (sold, reserved, etc.).
- Sales Statistics: View sales statistics including total count by date range, book, and status, with filtering options.
- Listing Generator: Module to create product listings with book selection, image upload, text input, and template selection, capable of using AI to refine the listing text tool.
- Configuration and Personalization: Persistent settings to save user preferences like visual theme and default settings.
- Local Data Storage: Local storage for catalog, inventory, sales, and settings data, with a strategy to migrate to a more robust solution as data volume grows.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to inspire trust and intelligence.
- Background color: Very light grayish-blue (#F0F4FF).
- Accent color: Orange-Yellow (#FFC107) for highlights, calls to action, and important information.
- Body and headline font: 'PT Sans', a humanist sans-serif.
- Simple, clear icons for each module, focusing on usability and quick recognition.
- Modular layout with clear separation of concerns, allowing easy addition of new tabs/modules without rewriting existing code.
- Subtle transitions and animations for actions like saving a sale or generating a listing, to provide user feedback without being distracting.