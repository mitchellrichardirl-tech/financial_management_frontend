import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker - use the version from pdfjs itself
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function ImagePreview({ 
  file, 
  alt = "Uploaded file",
  maxWidth = "100%",
  maxHeight = "400px",
  enableZoom = true
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileType, setFileType] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setIsLoading(false);
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
      setError('File must be an image or PDF');
      setIsLoading(false);
      return;
    }

    setFileType(isImage ? 'image' : 'pdf');
    setPageNumber(1);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);

    if (isPDF) {
      setIsLoading(true);
    }

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF');
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  const openModal = () => {
    if (enableZoom) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToPrevPage = (e) => {
    e.stopPropagation();
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = (e) => {
    e.stopPropagation();
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        {error}
      </div>
    );
  }

  if (!previewUrl) {
    return null;
  }

  return (
    <>
      <div style={{
        position: 'relative',
        maxWidth: maxWidth,
        cursor: enableZoom ? 'zoom-in' : 'default',
        width: '100%'
      }}>
        {isLoading && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }}>
            Loading...
          </div>
        )}
        
        {fileType === 'image' ? (
          <img
            src={previewUrl}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={openModal}
            style={{
              maxWidth: '100%',
              maxHeight: maxHeight,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: isLoading ? 'none' : 'block'
            }}
          />
        ) : (
          <div 
            onClick={openModal}
            style={{ display: isLoading ? 'none' : 'block' }}
          >
            <Document
              file={previewUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page 
                pageNumber={pageNumber}
                height={parseInt(maxHeight)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
            
            {numPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '10px'
              }}>
                <button 
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  style={{
                    padding: '5px 10px',
                    cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                    opacity: pageNumber <= 1 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>
                <span>Page {pageNumber} of {numPages}</span>
                <button 
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  style={{
                    padding: '5px 10px',
                    cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                    opacity: pageNumber >= numPages ? 0.5 : 1
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {enableZoom && !isLoading && (
          <div 
            onClick={openModal}
            style={{
              position: 'absolute',
              bottom: fileType === 'pdf' && numPages > 1 ? '50px' : '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Click to enlarge
          </div>
        )}
      </div>

      {/* Modal for zoomed view */}
      {isModalOpen && (
        <div 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            padding: '20px'
          }}
        >
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '32px',
              cursor: 'pointer',
              zIndex: 1001
            }}
          >
            ×
          </button>
          
          <div onClick={(e) => e.stopPropagation()}>
            {fileType === 'image' ? (
              <img
                src={previewUrl}
                alt={alt}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <>
                <Document
                  file={previewUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
                  <Page 
                    pageNumber={pageNumber}
                    width={Math.min(window.innerWidth * 0.9, 1200)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
                
                {numPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '20px',
                    color: 'white'
                  }}>
                    <button 
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      style={{
                        padding: '8px 16px',
                        cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                        opacity: pageNumber <= 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <button 
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      style={{
                        padding: '8px 16px',
                        cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer',
                        opacity: pageNumber >= numPages ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ImagePreview;