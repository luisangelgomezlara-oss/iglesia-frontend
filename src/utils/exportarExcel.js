export function exportarInformeMensual(ingresos, egresos, mes, anio) {

  const nombreIglesia = 'IPUC San Carlos'
  const distrito      = 'Distrito 27'
  const nombreMes     = obtenerNombreMes(mes)

  const totalIngresos = ingresos.reduce((s, i) => s + Number(i.monto), 0)
  const totalEgresos  = egresos.reduce((s, e) => s + Number(e.monto), 0)
  const saldo         = totalIngresos - totalEgresos
  const maxFilas      = Math.max(ingresos.length, egresos.length)

  const filas = Array.from({ length: maxFilas }, (_, i) => {
    const ing = ingresos[i]
    const eg  = egresos[i]
    return `
      <tr>
        <td class="label">${ing ? ing.catIngresoNombre : ''}</td>
        <td class="label">${ing ? (ing.comiteNombre !== '—' ? ing.comiteNombre : '') : ''}</td>
        <td class="monto">${ing ? formatCurrency(ing.monto) : ''}</td>
        <td class="separador"></td>
        <td class="label">${eg ? eg.catEgresoNombre : ''}</td>
        <td class="monto">${eg ? formatCurrency(eg.monto) : ''}</td>
      </tr>
    `
  }).join('')

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #cccccc; padding: 5px 8px; }
        .header-iglesia {
          background-color: #1B2A4A; color: white;
          font-weight: bold; font-size: 13pt; text-align: center;
        }
        .header-titulo {
          background-color: #1B2A4A; color: white;
          font-weight: bold; font-size: 13pt; text-align: center;
        }
        .header-distrito {
          background-color: #1B2A4A; color: white;
          font-weight: bold; font-size: 11pt; text-align: center;
        }
        .fila-deco { background-color: #EEF3FF; height: 8px; }
        .col-ing {
          background-color: #1A7A3C; color: white;
          font-weight: bold; font-size: 11pt; text-align: center;
        }
        .col-eg {
          background-color: #C0392B; color: white;
          font-weight: bold; font-size: 11pt; text-align: center;
        }
        .separador { background-color: #f2f4f8; border: none; width: 20px; }
        .label { text-align: left; font-size: 10pt; }
        .monto { text-align: right; font-size: 10pt; }
        .total-label {
          background-color: #1B2A4A; color: white;
          font-weight: bold; font-size: 11pt; text-align: center;
        }
        .total-monto {
          background-color: #1B2A4A; color: white;
          font-weight: bold; font-size: 11pt; text-align: right;
        }
        .total-vacio { background-color: #1B2A4A; border: 1px solid #1B2A4A; }
        .saldo-label {
          background-color: #C5A028; color: white;
          font-weight: bold; font-size: 12pt; text-align: center;
        }
        .saldo-monto {
          background-color: #C5A028; color: white;
          font-weight: bold; font-size: 12pt; text-align: right;
        }
        .saldo-vacio { background-color: #C5A028; border: 1px solid #C5A028; }
      </style>
    </head>
    <body>
      <table>
        <tr style="height: 32px;">
          <td colspan="3" class="header-iglesia">${nombreIglesia}</td>
          <td class="separador"></td>
          <td colspan="2" class="header-titulo">Informe Económico Mes de ${nombreMes} ${anio}</td>
        </tr>
        <tr style="height: 24px;">
          <td colspan="3" class="header-distrito">${distrito}</td>
          <td class="separador"></td>
          <td colspan="2" class="header-distrito">Generado el: ${new Date().toLocaleDateString('es-CO')}</td>
        </tr>
        <tr>
          <td colspan="3" class="fila-deco"></td>
          <td class="separador"></td>
          <td colspan="2" class="fila-deco"></td>
        </tr>
        <tr style="height: 26px;">
          <td class="col-ing">Ingresos</td>
          <td class="col-ing">Comité</td>
          <td class="col-ing">Total</td>
          <td class="separador"></td>
          <td class="col-eg">Egresos</td>
          <td class="col-eg">Total</td>
        </tr>
        ${filas}
        <tr style="height: 26px;">
          <td colspan="2" class="total-label">Total</td>
          <td class="total-monto">${formatCurrency(totalIngresos)}</td>
          <td class="separador"></td>
          <td class="total-label">Total</td>
          <td class="total-monto">${formatCurrency(totalEgresos)}</td>
        </tr>
        <tr>
          <td colspan="3" style="border:none; height:10px;"></td>
          <td class="separador"></td>
          <td colspan="2" style="border:none;"></td>
        </tr>
        <tr style="height: 28px;">
          <td colspan="2" class="saldo-label">Saldo a la Fecha</td>
          <td class="saldo-monto">${formatCurrency(saldo)}</td>
          <td class="separador"></td>
          <td class="saldo-vacio"></td>
          <td class="saldo-vacio"></td>
        </tr>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `Informe_${nombreMes}_${anio}_IPUC_SanCarlos.xls`
  link.click()
  URL.revokeObjectURL(url)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style:                 'currency',
    currency:              'COP',
    minimumFractionDigits: 0
  }).format(Number(value))
}

function obtenerNombreMes(mes) {
  const meses = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ]
  return meses[mes - 1] || 'Mes'
}