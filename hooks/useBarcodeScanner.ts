'use client'

import { useState, useCallback } from 'react'

interface UseBarcodeScannerOptions {
  onSuccess?: (barcode: string) => void
  onError?: (error: string) => void
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startScanning = useCallback(() => {
    setIsScanning(true)
    setError(null)
  }, [])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
  }, [])

  const handleScanSuccess = useCallback((barcode: string) => {
    setLastScannedBarcode(barcode)
    setIsScanning(false)
    setError(null)
    
    // Validação básica do código de barras
    if (isValidBarcode(barcode)) {
      options.onSuccess?.(barcode)
    } else {
      const errorMsg = 'Código de barras inválido'
      setError(errorMsg)
      options.onError?.(errorMsg)
    }
  }, [options])

  const handleScanError = useCallback((errorMsg: string) => {
    setError(errorMsg)
    setIsScanning(false)
    options.onError?.(errorMsg)
  }, [options])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearLastScanned = useCallback(() => {
    setLastScannedBarcode(null)
  }, [])

  return {
    isScanning,
    lastScannedBarcode,
    error,
    startScanning,
    stopScanning,
    handleScanSuccess,
    handleScanError,
    clearError,
    clearLastScanned
  }
}

// Validação de códigos de barras
function isValidBarcode(barcode: string): boolean {
  if (!barcode || typeof barcode !== 'string') return false
  
  // Remove espaços e caracteres especiais
  const cleanBarcode = barcode.replace(/[^0-9]/g, '')
  
  // Verifica comprimento para diferentes padrões
  const validLengths = [8, 12, 13, 14] // EAN-8, UPC-A, EAN-13, ITF-14
  
  if (!validLengths.includes(cleanBarcode.length)) return false
  
  // Validação de dígito verificador EAN-13
  if (cleanBarcode.length === 13) {
    return validateEAN13(cleanBarcode)
  }
  
  // Validação de dígito verificador UPC-A
  if (cleanBarcode.length === 12) {
    return validateUPCA(cleanBarcode)
  }
  
  return true
}

function validateEAN13(barcode: string): boolean {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode[i])
    sum += (i % 2 === 0) ? digit : digit * 3
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(barcode[12])
}

function validateUPCA(barcode: string): boolean {
  let sum = 0
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(barcode[i])
    sum += (i % 2 === 0) ? digit * 3 : digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === parseInt(barcode[11])
}
