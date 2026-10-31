import React, { useState, useRef } from 'react';
import { Camera, Mic, Image, X } from 'lucide-react';

const MediaAttachments = ({ onMediaAdd, attachments = [] }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          onMediaAdd({
            id: Date.now() + Math.random(),
            type: 'image',
            data: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = 'block';
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Camera access denied or not available');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && streamRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg');
      onMediaAdd({
        id: Date.now(),
        type: 'image',
        data: imageData,
        name: `photo_${new Date().toISOString()}.jpg`
      });

      // Stop camera
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.style.display = 'none';
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onload = (e) => {
          onMediaAdd({
            id: Date.now(),
            type: 'audio',
            data: e.target.result,
            name: `recording_${new Date().toISOString()}.wav`,
            duration: recordingTime
          });
        };
        reader.readAsDataURL(blob);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const removeAttachment = (id) => {
    onMediaAdd(null, id); // Pass null data and id to remove
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border-t border-gray-200">
      {/* Camera preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-h-48 object-cover rounded-lg mb-4"
        style={{ display: 'none' }}
      />

      {/* Attachment buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
        >
          <Image size={16} />
          Gallery
        </button>

        <button
          onClick={handleCameraCapture}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
        >
          <Camera size={16} />
          Camera
        </button>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            isRecording ? 'bg-red-500 text-white' : 'bg-gray-100'
          }`}
        >
          <Mic size={16} />
          {isRecording ? `Stop (${formatTime(recordingTime)})` : 'Record'}
        </button>

        {videoRef.current && videoRef.current.style.display !== 'none' && (
          <button
            onClick={takePhoto}
            className="flex items-center gap-2 px-3 py-2 bg-brand-bright text-white rounded-lg text-sm"
          >
            Take Photo
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Attachments:</h4>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div key={attachment.id} className="relative">
                {attachment.type === 'image' && (
                  <div className="relative">
                    <img
                      src={attachment.data}
                      alt={attachment.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {attachment.type === 'audio' && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <Mic size={16} />
                    <span className="text-sm">Audio ({formatTime(attachment.duration || 0)})</span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaAttachments;
