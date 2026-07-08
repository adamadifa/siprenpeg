import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Swal from 'sweetalert2'
import {
  IconFingerprint,
  IconMapPin,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconArrowLeft,
  IconSwitchHorizontal,
  IconClock
} from '@tabler/icons-react'
import { getCheckinStatus, storeEmployeePresensi } from '../api/presensi'

const Presensi: React.FC = () => {
  const navigate = useNavigate()
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState<string>('')
  const [cameraError, setCameraError] = useState<string>('')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [time, setTime] = useState(new Date())

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const userMarker = useRef<L.Marker | null>(null)
  const officeMarker = useRef<L.Marker | null>(null)
  const radiusCircle = useRef<L.Circle | null>(null)

  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ['checkinStatus'],
    queryFn: getCheckinStatus
  })

  const checkinInfo = statusData?.data
  const officeCoords = checkinInfo?.lokasi_kantor?.lokasi_cabang
    ? checkinInfo.lokasi_kantor.lokasi_cabang.split(',').map(Number)
    : null

  const [distance, setDistance] = useState<number | null>(null)
  const isInsideRadius = checkinInfo?.lock_location === 0 || (
    distance !== null && checkinInfo?.lokasi_kantor?.radius_cabang !== undefined
      ? distance <= checkinInfo.lokasi_kantor.radius_cabang
      : true
  )

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const startGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
          setGpsError('')
        },
        () => setGpsError('Akses GPS ditolak.'),
        { enableHighAccuracy: true, timeout: 15000 }
      )
    } else {
      setGpsError('GPS tidak didukung.')
    }
  }

  useEffect(() => {
    if (coords && officeCoords) {
      const R = 6371000
      const dLat = (officeCoords[0] - coords.lat) * Math.PI / 180
      const dLon = (officeCoords[1] - coords.lng) * Math.PI / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coords.lat * Math.PI / 180) * Math.cos(officeCoords[0] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      setDistance(Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))))
    }
  }, [coords, officeCoords])

  const startCamera = async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 480 }, height: { ideal: 480 } }, audio: false
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraError('')
    } catch { setCameraError('Gagal membuka kamera.') }
  }

  useEffect(() => {
    startGps()
    startCamera()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null }
    }
  }, [facingMode])

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!coords || !mapRef.current) return

    // Custom marker icons
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:14px;height:14px;background:#064e3b;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })
    const officeIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#dc2626;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })

    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 17,
        zoomControl: false,
        attributionControl: false
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap.current)
    }

    // User marker
    if (userMarker.current) userMarker.current.setLatLng([coords.lat, coords.lng])
    else userMarker.current = L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(leafletMap.current).bindPopup('Posisi Anda')

    // Office marker + radius
    if (officeCoords) {
      const radius = checkinInfo?.lokasi_kantor?.radius_cabang ?? 200
      if (officeMarker.current) {
        officeMarker.current.setLatLng([officeCoords[0], officeCoords[1]])
      } else {
        officeMarker.current = L.marker([officeCoords[0], officeCoords[1]], { icon: officeIcon }).addTo(leafletMap.current).bindPopup('Lokasi Kantor')
      }
      if (radiusCircle.current) {
        radiusCircle.current.setLatLng([officeCoords[0], officeCoords[1]]).setRadius(radius)
      } else {
        radiusCircle.current = L.circle([officeCoords[0], officeCoords[1]], {
          radius,
          color: '#064e3b',
          fillColor: '#064e3b',
          fillOpacity: 0.08,
          weight: 1.5
        }).addTo(leafletMap.current)
      }

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([coords.lat, coords.lng], [officeCoords[0], officeCoords[1]])
      leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 })
    } else {
      leafletMap.current.setView([coords.lat, coords.lng], 17)
    }
  }, [coords, officeCoords, checkinInfo])

  const handleSubmit = async (status: number) => {
    if (!coords) {
      Swal.fire({ title: 'GPS Belum Siap', text: 'Menunggu koordinat GPS Anda...', icon: 'warning', confirmButtonColor: '#064e3b' })
      return
    }
    if (!videoRef.current || !streamRef.current) {
      Swal.fire({ title: 'Kamera Belum Siap', text: 'Mohon tunggu sampai kamera aktif...', icon: 'warning', confirmButtonColor: '#064e3b' })
      return
    }
    setIsSubmitting(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth || 480
      canvas.height = videoRef.current.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const res = await storeEmployeePresensi({
          status,
          lokasi: `${coords.lat},${coords.lng}`,
          kode_jam_kerja: checkinInfo?.jam_kerja?.kode_jam_kerja || 'JK01',
          image: canvas.toDataURL('image/png')
        })
        if (res.success) {
          Swal.fire({
            title: 'Berhasil!',
            text: res.message,
            icon: 'success',
            confirmButtonColor: '#064e3b',
            timer: 1500,
            showConfirmButton: false
          })
          refetch()
          setTimeout(() => navigate('/dashboard'), 1500)
        } else {
          Swal.fire({
            title: 'Gagal!',
            text: res.message || 'Gagal menyimpan absensi.',
            icon: 'error',
            confirmButtonColor: '#dc2626'
          })
        }
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error!',
        text: err.response?.data?.message || 'Terjadi kesalahan pada sistem.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 mt-3 text-xs font-medium">Memuat data absensi...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Green brand top section */}
      <div className="bg-[#064e3b] px-5 pt-5 pb-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
            <IconArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-base font-bold text-white tracking-wide">Presensi Kehadiran</h1>
        </div>

        {/* Shift & Time Row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconClock size={16} className="text-[#a7f3d0]" />
            <span className="text-xs text-[#a7f3d0] font-medium">
              {checkinInfo?.jam_kerja?.nama_jam_kerja || 'Jam Kerja'} ({checkinInfo?.jam_kerja?.jam_masuk || '--:--'} - {checkinInfo?.jam_kerja?.jam_pulang || '--:--'})
            </span>
          </div>
          <span className="text-xs text-white/80 font-semibold tabular-nums">{formatTime(time)}</span>
        </div>
      </div>

      {/* Camera Card — overlaps the green block */}
      <div className="px-5 -mt-14">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Camera View */}
          <div className="w-full aspect-square relative bg-gray-900 flex items-center justify-center">
            {cameraError ? (
              <div className="text-center p-6">
                <IconAlertCircle className="text-gray-400 mx-auto mb-2" size={32} />
                <p className="text-xs text-gray-400">{cameraError}</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                {/* Scanning frame */}
                <div className="absolute inset-8 border-2 border-white/20 rounded-full pointer-events-none" />
                <div className="absolute inset-8 border border-[#064e3b]/30 rounded-full scale-90 animate-pulse pointer-events-none" />
              </>
            )}

            {!cameraError && (
              <>
                {coords && (
                  <div className="absolute bottom-3 left-3 w-28 h-28 rounded-xl border-2 border-white shadow-lg overflow-hidden z-10 opacity-75 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <div ref={mapRef} className="w-full h-full" />
                  </div>
                )}
                <button
                  onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')}
                  className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <IconSwitchHorizontal size={16} />
                </button>
              </>
            )}
          </div>

          {/* Location Info — Inside Same Card */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isInsideRadius ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <IconMapPin size={18} className={isInsideRadius ? 'text-emerald-600' : 'text-rose-500'} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Lokasi GPS</p>
                {coords ? (
                  <>
                    <p className="text-xs text-gray-600 truncate mt-0.5">{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}</p>
                    <p className={`text-sm font-bold mt-0.5 ${isInsideRadius ? 'text-[#064e3b]' : 'text-rose-600'}`}>
                      {distance !== null ? `${distance} m dari kantor` : 'Mengukur...'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Radius maks: {checkinInfo?.lokasi_kantor?.radius_cabang ?? 0} m</p>
                  </>
                ) : (
                  <p className="text-xs text-rose-500 font-medium mt-0.5">{gpsError || 'Mencari sinyal GPS...'}</p>
                )}
              </div>
              <button onClick={() => { startGps(); }} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0">
                <IconRefresh size={14} className="text-gray-500" />
              </button>
            </div>

            {/* Zona status bar */}
            <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
              isInsideRadius
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}>
              {isInsideRadius
                ? <><IconCheck size={14} className="text-emerald-600 shrink-0" /> Anda berada di dalam zona absensi.</>
                : <><IconAlertCircle size={14} className="text-rose-500 shrink-0" /> Di luar zona absensi. Dekatkan ke kantor.</>
              }
            </div>
          </div>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="px-5 mt-5">
        {isSubmitting ? (
          <div className="w-full flex items-center justify-center gap-3 py-3.5 bg-emerald-50 rounded-xl border border-emerald-100 animate-pulse">
            <span className="w-4 h-4 border-2 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#064e3b] font-semibold">Memproses absensi, mohon tunggu...</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(1)}
              disabled={!!checkinInfo?.presensi?.jam_in}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                checkinInfo?.presensi?.jam_in
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#064e3b] text-white hover:bg-[#053e30] active:scale-[0.98]'
              }`}
            >
              <IconFingerprint size={18} />
              {checkinInfo?.presensi?.jam_in ? 'Sudah Masuk' : 'Absen Masuk'}
            </button>

            <button
              onClick={() => handleSubmit(2)}
              disabled={!!checkinInfo?.presensi?.jam_out}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                checkinInfo?.presensi?.jam_out
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-rose-600 text-white hover:bg-rose-500 active:scale-[0.98]'
              }`}
            >
              <IconFingerprint size={18} />
              {checkinInfo?.presensi?.jam_out ? 'Sudah Pulang' : 'Absen Pulang'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Presensi
