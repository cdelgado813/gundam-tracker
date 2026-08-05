## 1. Paso de confirmación tras crear colección desde selección múltiple

- [x] 1.1 `BulkAssignBar.tsx`: añadir estado local para el paso post-creación (p. ej. `justCreatedCollectionIds: number[] | null`, guardando los ids seleccionados en el momento de crear)
- [x] 1.2 `createAndAssign`: tras `assignCollection(id)`, en vez de solo cerrar el sub-panel, pasar al paso de confirmación con los ids de la selección usada
- [x] 1.3 Renderizar el paso de confirmación dentro del panel `collections` (mensaje con recuento + botón "marcar en propiedad" que llama a `addCardsToOwned` + botón "solo asignar" que descarta el paso)
- [x] 1.4 Confirmar que el paso NO aparece al asignar a una colección ya existente (solo tras crear una nueva)
- [x] 1.5 Añadir claves de traducción necesarias (mensaje de confirmación, botones) en `webapp/src/lib/i18n.ts` (es/en/ca)

## 2. Verificación

- [x] 2.1 Probar manualmente: crear colección desde selección múltiple, aceptar marcar en propiedad, comprobar +1 copia Near Mint/en por carta
- [x] 2.2 Probar manualmente: crear colección desde selección múltiple, omitir el paso, comprobar que la colección en propiedad no cambia
- [x] 2.3 Probar manualmente: asignar a una colección ya existente y comprobar que no aparece el paso adicional
- [x] 2.4 `npm run build` limpio
