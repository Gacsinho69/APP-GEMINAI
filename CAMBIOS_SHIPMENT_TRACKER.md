# Correcciones Realizadas al Código Shipment Tracker

## Problemas Identificados y Solucionados

### 1. **Formato Condicional Incorrecto** ✅

**Problema Original:**
```javascript
SpreadsheetApp.newConditionalFormatRule()
  .whenTextEqualTo("Delivered")
  .setBackground("#D9EBD3")
  .setRanges([sh.getRange(2,1,lastRow,16)])
  .setCriteriaType(SpreadsheetApp.ConditionalFormatCriteria.TEXT_EQ)  // ❌ Redundante
  .setGradientMaxpointWithValue(null)  // ❌ Incorrecto
  .build()
```

**Solución:**
```javascript
SpreadsheetApp.newConditionalFormatRule()
  .whenFormulaSatisfied('=$K2="Delivered"')  // ✅ Usa fórmula para referenciar columna K
  .setBackground("#D9EBD3")
  .setRanges([sh.getRange(2, 1, lastRow - 1, 16)])
  .build()
```

**Por qué:** `whenTextEqualTo()` evalúa cada celda individualmente, no la columna K específicamente. Para colorear toda la fila basándose en el Status (columna K), necesitamos usar `whenFormulaSatisfied()` con una referencia absoluta a la columna (`=$K2`).

### 2. **Filtro Duplicado** ✅

**Problema Original:**
```javascript
// Al inicio:
if (!sh.getFilter()) sh.getRange(1,1, sh.getMaxRows(), sh.getMaxColumns()).createFilter();

// Al final:
sh.getRange(1,1, sh.getMaxRows(), sh.getMaxColumns()).createFilter();  // ❌ Duplicado
const filter = sh.getFilter();
filter.sort(8, true);
```

**Solución:**
```javascript
// Al inicio: crear filtro solo si no existe
if (!sh.getFilter()) {
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).createFilter();
}

// Al final: usar el filtro existente
try {
  const filter = sh.getFilter();
  if (filter) {
    filter.sort(8, true);
  }
} catch(e) {
  Logger.log("Could not sort filter: " + e.toString());
}
```

### 3. **FillDown Excesivo** ✅

**Problema Original:**
```javascript
sh.getRange("L2").setFormula('...');
sh.getRange(2,12,lastRow-1,1).fillDown();  // ❌ Llena 999+ filas vacías
```

**Solución:**
```javascript
const formulaRow = sh.getRange("L2");
if (!formulaRow.getFormula()) {
  formulaRow.setFormula('...');
}
// La fórmula se aplicará dinámicamente en onEdit para nuevas filas
```

### 4. **Fórmula COUNTIF Mejorada** ✅

**Problema Original:**
```javascript
dash.getRange("B7").setFormula(
  '=COUNTIF(FILTER(Shipments!H2:H, Shipments!K2:K<>"Delivered", Shipments!H2:H<>""), "<"&TODAY()-3)'
);
```

**Solución:**
```javascript
dash.getRange("B7").setFormula(
  '=SUMPRODUCT((Shipments!H2:H<TODAY()-3)*(Shipments!K2:K<>"Delivered")*(Shipments!H2:H<>""))'
);
```

**Por qué:** SUMPRODUCT es más eficiente y no requiere FILTER, funciona mejor en versiones antiguas de Sheets.

### 5. **Mejoras Adicionales** ✅

- **Espaciado consistente:** Todos los parámetros ahora usan espaciado consistente
- **Manejo de errores mejorado:** Agregado `Logger.log()` para debugging
- **Alerta de confirmación:** Agregado mensaje al final de `setupShipmentTracker()`
- **Optimización en onEdit:** Solo actualiza la fórmula si es necesario

## Cómo Usar el Código Corregido

1. Abre tu Google Sheet
2. Ve a **Extensiones > Apps Script**
3. Copia y pega el contenido de `shipment-tracker.gs`
4. Guarda el proyecto
5. Ejecuta la función `setupShipmentTracker()`
6. Autoriza los permisos necesarios

## Funcionalidades del Tracker

- ✅ Seguimiento de envíos con múltiples estados
- ✅ Validación de datos mediante dropdowns
- ✅ Formato condicional automático por estado
- ✅ Alertas de ETA vencido
- ✅ Dashboard con métricas y gráficos
- ✅ Actualización automática de timestamps
- ✅ Cálculo automático de progreso

## Columnas Principales

| Columna | Nombre | Tipo |
|---------|--------|------|
| A | Shipment ID | Texto |
| B | Supplier / Factory | Texto |
| C | Agent | Texto |
| D | Origin Port | Dropdown |
| E | Destination Port | Dropdown |
| F | Incoterm | Dropdown |
| G | ETD | Fecha |
| H | ETA | Fecha |
| I | Forwarder / Courier | Dropdown |
| J | Tracking / BL No. | Texto |
| K | Status | Dropdown |
| L | Progress (%) | Fórmula automática |
| M | Last Update | Timestamp automático |
| N | Next Step | Texto |
| O | Remarks | Texto |
| P | Files / Links | Texto |
