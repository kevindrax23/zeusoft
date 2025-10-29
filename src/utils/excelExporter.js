import * as XLSX from 'xlsx'
import { formatCurrency, formatDate } from '@/config/settings'

export const exportReportToExcel = (data, filters, stats) => {
  const wb = XLSX.utils.book_new()

  // ===== HOJA 1: PORTADA =====
  const portadaData = [
    ['ZEUSOFT'],
    ['Sistema de Gestión Empresarial'],
    [''],
    ['REPORTE DE VENTAS Y ANÁLISIS'],
    [''],
    [''],
    ['Información del Reporte'],
    ['Período:', filters.periodLabel],
    ['Fecha Inicio:', filters.fechaInicio ? formatDate(filters.fechaInicio) : 'N/A'],
    ['Fecha Fin:', filters.fechaFin ? formatDate(filters.fechaFin) : 'N/A'],
    ['Fecha de Generación:', formatDate(new Date())],
    ['Generado por:', 'ZeusSoft'],
    [''],
    [''],
    ['RESUMEN EJECUTIVO'],
    [''],
    ['Indicador', 'Valor'],
    ['Total Ventas', formatCurrency(stats.totalSales)],
    ['Total Facturas', stats.totalInvoices],
    ['Facturas Pagadas', stats.paidInvoices],
    ['Facturas Pendientes', stats.pendingInvoices],
    ['Productos Vendidos', stats.productsSold],
    ['Clientes Activos', stats.activeCustomers || stats.totalCustomers],
  ]

  const wsPortada = XLSX.utils.aoa_to_sheet(portadaData)

  // Estilos para portada
  wsPortada['!cols'] = [{ wch: 30 }, { wch: 35 }]
  wsPortada['!rows'] = [
    { hpt: 30 }, // Título grande
    { hpt: 20 }, // Subtítulo
    { hpt: 10 },
    { hpt: 25 }, // Título sección
  ]

  XLSX.utils.book_append_sheet(wb, wsPortada, 'Portada')

  // ===== HOJA 2: FACTURAS DETALLADAS =====
  const facturas = data.invoices || []

  const facturasData = [
    ['FACTURAS EMITIDAS - DETALLE COMPLETO'],
    [''],
    ['#', 'Número', 'Fecha', 'Cliente', 'Documento', 'Email', 'Teléfono', 'Estado', 'Subtotal', 'IVA', 'Total']
  ]

  let totalFacturado = 0
  let totalIVA = 0
  let totalGeneral = 0

  facturas.forEach((inv, index) => {
    facturasData.push([
      index + 1,
      inv.numeroFactura,
      formatDate(inv.fechaEmision),
      inv.cliente?.nombre || 'N/A',
      `${inv.cliente?.tipoDocumento || ''} ${inv.cliente?.numeroDocumento || ''}`,
      inv.cliente?.email || 'N/A',
      inv.cliente?.telefono || 'N/A',
      inv.estado.toUpperCase(),
      parseFloat(inv.subtotal),
      parseFloat(inv.montoImpuesto),
      parseFloat(inv.total)
    ])

    if (inv.estado !== 'anulada') {
      totalFacturado += parseFloat(inv.subtotal)
      totalIVA += parseFloat(inv.montoImpuesto)
      totalGeneral += parseFloat(inv.total)
    }
  })

  // Fila de totales
  facturasData.push([])
  facturasData.push(['', '', '', '', '', '', '', 'TOTALES:', totalFacturado, totalIVA, totalGeneral])

  const wsFacturas = XLSX.utils.aoa_to_sheet(facturasData)

  wsFacturas['!cols'] = [
    { wch: 5 },  // #
    { wch: 15 }, // Número
    { wch: 12 }, // Fecha
    { wch: 30 }, // Cliente
    { wch: 20 }, // Documento
    { wch: 28 }, // Email
    { wch: 15 }, // Teléfono
    { wch: 12 }, // Estado
    { wch: 15 }, // Subtotal
    { wch: 15 }, // IVA
    { wch: 15 }  // Total
  ]

  XLSX.utils.book_append_sheet(wb, wsFacturas, 'Facturas')

  // ===== HOJA 3: PRODUCTOS MÁS VENDIDOS =====
  const productos = data.topProducts || []

  const productosData = [
    ['TOP PRODUCTOS - ANÁLISIS DE VENTAS'],
    [''],
    ['Ranking', 'Código', 'Nombre del Producto', 'Categoría', 'Unidades Vendidas', 'Ingresos Generados', '% del Total']
  ]

  const totalIngresos = productos.reduce((sum, p) => sum + p.ingresos, 0)

  productos.forEach((prod, index) => {
    const porcentaje = totalIngresos > 0 ? ((prod.ingresos / totalIngresos) * 100).toFixed(2) + '%' : '0%'
    productosData.push([
      `${index + 1}`,
      prod.codigo,
      prod.nombre,
      prod.categoria.toUpperCase(),
      prod.cantidadVendida,
      parseFloat(prod.ingresos),
      porcentaje
    ])
  })

  productosData.push([])
  productosData.push(['', '', 'TOTAL GENERAL', '', productos.reduce((sum, p) => sum + p.cantidadVendida, 0), totalIngresos, '100%'])

  const wsProductos = XLSX.utils.aoa_to_sheet(productosData)

  wsProductos['!cols'] = [
    { wch: 10 }, // Ranking
    { wch: 15 }, // Código
    { wch: 40 }, // Nombre
    { wch: 18 }, // Categoría
    { wch: 18 }, // Unidades
    { wch: 20 }, // Ingresos
    { wch: 12 }  // %
  ]

  XLSX.utils.book_append_sheet(wb, wsProductos, 'Top Productos')

  // ===== HOJA 4: DETALLE DE ITEMS =====
  const detalleItems = [
    ['DETALLE COMPLETO DE PRODUCTOS VENDIDOS'],
    [''],
    ['#', 'Factura', 'Fecha', 'Cliente', 'Producto', 'Código', 'Categoría', 'Cant.', 'P. Unitario', 'Subtotal']
  ]

  let itemCounter = 0
  let totalItemsVendidos = 0
  let totalIngresoItems = 0

  facturas.forEach(inv => {
    inv.items?.forEach(item => {
      itemCounter++
      totalItemsVendidos += item.cantidad
      totalIngresoItems += item.subtotal

      detalleItems.push([
        itemCounter,
        inv.numeroFactura,
        formatDate(inv.fechaEmision),
        inv.cliente?.nombre || 'N/A',
        item.nombre,
        item.codigo,
        item.producto?.categoria || 'N/A',
        item.cantidad,
        parseFloat(item.precioUnitario),
        parseFloat(item.subtotal)
      ])
    })
  })

  detalleItems.push([])
  detalleItems.push(['', '', '', '', '', '', 'TOTALES:', totalItemsVendidos, '', totalIngresoItems])

  const wsDetalleItems = XLSX.utils.aoa_to_sheet(detalleItems)

  wsDetalleItems['!cols'] = [
    { wch: 6 },  // #
    { wch: 15 }, // Factura
    { wch: 12 }, // Fecha
    { wch: 30 }, // Cliente
    { wch: 40 }, // Producto
    { wch: 15 }, // Código
    { wch: 15 }, // Categoría
    { wch: 8 },  // Cant
    { wch: 15 }, // P. Unit
    { wch: 15 }  // Subtotal
  ]

  XLSX.utils.book_append_sheet(wb, wsDetalleItems, 'Detalle Items')

  // ===== HOJA 5: ANÁLISIS DE CLIENTES =====
  const clientesMap = new Map()

  facturas.forEach(inv => {
    if (inv.cliente && inv.estado !== 'anulada') {
      const clienteId = inv.cliente._id
      if (!clientesMap.has(clienteId)) {
        clientesMap.set(clienteId, {
          nombre: inv.cliente.nombre,
          documento: `${inv.cliente.tipoDocumento || ''} ${inv.cliente.numeroDocumento || ''}`,
          email: inv.cliente.email || 'N/A',
          telefono: inv.cliente.telefono || 'N/A',
          totalCompras: 0,
          numFacturas: 0,
          primeraCompra: inv.fechaEmision,
          ultimaCompra: inv.fechaEmision
        })
      }
      const cliente = clientesMap.get(clienteId)
      cliente.totalCompras += inv.total
      cliente.numFacturas += 1
      if (new Date(inv.fechaEmision) < new Date(cliente.primeraCompra)) {
        cliente.primeraCompra = inv.fechaEmision
      }
      if (new Date(inv.fechaEmision) > new Date(cliente.ultimaCompra)) {
        cliente.ultimaCompra = inv.fechaEmision
      }
    }
  })

  const clientesData = [
    ['ANÁLISIS DE CLIENTES - COMPORTAMIENTO DE COMPRA'],
    [''],
    ['#', 'Cliente', 'Documento', 'Email', 'Teléfono', 'Nº Compras', 'Total Comprado', 'Ticket Promedio', 'Primera Compra', 'Última Compra', 'Categoría']
  ]

  const clientesArray = Array.from(clientesMap.values()).sort((a, b) => b.totalCompras - a.totalCompras)

  clientesArray.forEach((cliente, index) => {
    const ticketPromedio = cliente.totalCompras / cliente.numFacturas
    let categoria = ''

    if (cliente.totalCompras > 5000000) categoria = 'VIP'
    else if (cliente.totalCompras > 2000000) categoria = 'Premium'
    else if (cliente.totalCompras > 500000) categoria = 'Regular'
    else categoria = 'Nuevo'

    clientesData.push([
      index + 1,
      cliente.nombre,
      cliente.documento,
      cliente.email,
      cliente.telefono,
      cliente.numFacturas,
      parseFloat(cliente.totalCompras),
      parseFloat(ticketPromedio),
      formatDate(cliente.primeraCompra),
      formatDate(cliente.ultimaCompra),
      categoria
    ])
  })

  const totalClienteCompras = clientesArray.reduce((sum, c) => sum + c.totalCompras, 0)
  const totalClienteFacturas = clientesArray.reduce((sum, c) => sum + c.numFacturas, 0)

  clientesData.push([])
  clientesData.push(['', 'TOTALES', '', '', '', totalClienteFacturas, totalClienteCompras, '', '', '', ''])

  const wsClientes = XLSX.utils.aoa_to_sheet(clientesData)

  wsClientes['!cols'] = [
    { wch: 6 },  // #
    { wch: 35 }, // Cliente
    { wch: 20 }, // Documento
    { wch: 28 }, // Email
    { wch: 15 }, // Teléfono
    { wch: 12 }, // Nº Compras
    { wch: 18 }, // Total
    { wch: 18 }, // Ticket Promedio
    { wch: 15 }, // Primera
    { wch: 15 }, // Última
    { wch: 15 }  // Categoría
  ]

  XLSX.utils.book_append_sheet(wb, wsClientes, 'Clientes')

  // ===== HOJA 6: VENTAS MENSUALES =====
  if (data.monthlySales && data.monthlySales.length > 0) {
    const ventasData = [
      ['EVOLUCIÓN DE VENTAS MENSUALES'],
      [''],
      ['Mes', 'Total Ventas', 'Variación %']
    ]

    data.monthlySales.forEach((venta, index) => {
      let variacion = ''
      if (index > 0) {
        const ventaAnterior = data.monthlySales[index - 1].total
        const cambio = ((venta.total - ventaAnterior) / ventaAnterior) * 100
        variacion = cambio > 0 ? `+${cambio.toFixed(1)}%` : `${cambio.toFixed(1)}%`
      } else {
        variacion = '➖ N/A'
      }

      ventasData.push([
        venta.mes,
        parseFloat(venta.total),
        variacion
      ])
    })

    const totalVentasMes = data.monthlySales.reduce((sum, v) => sum + v.total, 0)
    const promedioMensual = totalVentasMes / data.monthlySales.length

    ventasData.push([])
    ventasData.push(['TOTAL PERÍODO', totalVentasMes, ''])
    ventasData.push(['PROMEDIO MENSUAL', promedioMensual, ''])

    const wsVentas = XLSX.utils.aoa_to_sheet(ventasData)

    wsVentas['!cols'] = [
      { wch: 20 }, // Mes
      { wch: 20 }, // Total
      { wch: 15 }  // Variación
    ]

    XLSX.utils.book_append_sheet(wb, wsVentas, 'Ventas Mensuales')
  }

  // ===== HOJA 7: RESUMEN ESTADÍSTICO =====
  const estadisticasData = [
    ['RESUMEN ESTADÍSTICO DEL PERÍODO'],
    [''],
    ['INDICADORES GENERALES'],
    ['Métrica', 'Valor'],
    [''],
    ['VENTAS'],
    ['Total Facturado', formatCurrency(stats.totalSales)],
    ['Total Facturas Emitidas', stats.totalInvoices],
    ['Facturas Pagadas', stats.paidInvoices],
    ['Facturas Pendientes', stats.pendingInvoices],
    ['Ticket Promedio', stats.totalInvoices > 0 ? formatCurrency(stats.totalSales / stats.totalInvoices) : '$0'],
    [''],
    ['PRODUCTOS'],
    ['Total Unidades Vendidas', stats.productsSold],
    ['Productos Únicos', stats.uniqueProducts],
    ['Promedio por Factura', stats.totalInvoices > 0 ? (stats.productsSold / stats.totalInvoices).toFixed(2) : '0'],
    [''],
    ['CLIENTES'],
    ['Clientes Activos', stats.totalCustomers],
    ['Compras por Cliente', stats.totalCustomers > 0 ? (stats.totalInvoices / stats.totalCustomers).toFixed(2) : '0'],
    [''],
    ['INSIGHTS'],
    ['Producto Más Vendido', productos[0]?.nombre || 'N/A'],
    ['Cliente Top', clientesArray[0]?.nombre || 'N/A'],
    ['Mejor Mes', data.monthlySales?.reduce((max, v) => v.total > max.total ? v : max, { total: 0, mes: 'N/A' }).mes || 'N/A']
  ]

  const wsEstadisticas = XLSX.utils.aoa_to_sheet(estadisticasData)

  wsEstadisticas['!cols'] = [{ wch: 35 }, { wch: 30 }]

  XLSX.utils.book_append_sheet(wb, wsEstadisticas, 'Estadísticas')

  // Generar nombre de archivo
  const fileName = `Reporte_ZeusSoft_${filters.periodLabel.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`

  // Descargar el archivo
  XLSX.writeFile(wb, fileName)
}
