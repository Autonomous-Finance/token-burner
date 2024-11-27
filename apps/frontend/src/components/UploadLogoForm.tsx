import { UploadFile } from "@mui/icons-material"
import { Button, Stack, Typography, styled, Box } from "@mui/material"
import { DataItem } from "arbundles"
import { useState, useRef, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

const MAX_FILE_SIZE = 100000 // 100KB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

interface UploadLogoFormProps {
  onUploadSuccess: (txid: string) => void
  currentLogo?: string
  type?: string
}

export function UploadLogoForm({ onUploadSuccess, currentLogo, type }: UploadLogoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedTxId, setUploadedTxId] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        return
      }
      setPreview(URL.createObjectURL(file))
      uploadToArweave(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/jpg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "Max file size is 100KB."
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return ".jpg, .jpeg, .png and .webp files are accepted."
    }
    return null
  }

  const uploadToArweave = async (file: File) => {
    setIsLoading(true)
    setUploadProgress(25)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      const signed = await (window.arweaveWallet as any).signDataItem({
        data: uint8Array,
        tags: [
          {
            name: "Content-Type",
            value: file.type,
          },
          {
            name: "App",
            value: "CoinMaker",
          },
        ],
      })

      // load the result into a DataItem instance
      const dataItem = new DataItem(signed)

      // now you can submit it to a bunder
      const upload = await fetch("https://upload.ardrive.io/v1/tx", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          accept: "application/json",
        },
        body: dataItem.getRaw(),
      })

      // Get the response from upload
      const response = await upload.json()

      if (response.id) {
        toast.success("Logo uploaded successfully!", {
          description: "Your logo has been uploaded to Arweave.",
        })

        onUploadSuccess(response.id)
      } else {
        throw new Error("Transaction ID not found.")
      }
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while uploading the logo.", {
        description: JSON.stringify(error),
      })
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        return
      }
      setPreview(URL.createObjectURL(file))
      await uploadToArweave(file)
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const validationError = validateFile(file)
      if (validationError) {
        toast.error(validationError)
        return
      }

      await uploadToArweave(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleClick = () => {
    return fileInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setUploadedTxId(null)
    onUploadSuccess("")
  }

  return (
    <Box width="100%">
      <Stack spacing={2} alignItems="start">
        {preview || currentLogo ? (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: type === "CoverImage" ? "200px" : "64px",
              overflow: "hidden",
            }}
          >
            <img
              src={preview || `https://arweave.net/${currentLogo}`}
              alt="Uploaded Logo"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: type === "CoverImage" ? "100%" : "64px",
                height: type === "CoverImage" ? "200px" : "64px",
                objectFit: "contain",
              }}
            />
            {uploadProgress > 0 && uploadProgress < 100 ? (
              <Box sx={{ position: "absolute", bottom: 0, zIndex: 10 }}>
                Uploading... {uploadProgress}%
              </Box>
            ) : null}
            {/* Overlay */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: 0,
                transition: "opacity 0.3s",
                "&:hover": {
                  opacity: 1,
                },
              }}
            >
              <Button
                component="label"
                variant="contained"
                color="primary"
                onClick={handleRemoveImage}
              >
                Remove Image
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            component="div"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handleClick}
            {...getRootProps()}
            sx={{
              borderColor: "divider",
              borderRadius: 1,
              padding: 2,
              textAlign: "center",
              cursor: "pointer",
              width: "100%",
              height: "140px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
            }}
          >
            <UploadFile sx={{ fontSize: 40, color: "text.secondary" }} />

            <Typography variant="body1" sx={{ mb: 1 }}>
              {isDragActive
                ? "Drop the file here"
                : "Drag and drop your logo here or click to select a file"}
            </Typography>

            <VisuallyHiddenInput
              type="file"
              onChange={handleFileChange}
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              ref={fileInputRef}
              {...getInputProps()}
            />
          </Box>
        )}
      </Stack>
    </Box>
  )
}
