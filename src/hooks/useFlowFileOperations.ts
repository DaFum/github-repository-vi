import { useRef } from 'react'
import React from 'react'
import { toast } from 'sonner'
import { BlueprintRegistry } from '@/lib/store/BlueprintRegistry'

export const useFlowFileOperations = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => BlueprintRegistry.exportBlueprint()

  const handleImportClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const success = await BlueprintRegistry.importBlueprint(file)
      if (success) toast.success('Blueprint Imported')
      else toast.error('Import Failed')
    }
  }

  return { fileInputRef, handleExport, handleImportClick, handleFileChange }
}
