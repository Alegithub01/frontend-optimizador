"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF } from "@react-three/drei"
import { Suspense, useState, useRef, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CourseCarousel from "./course-carousel"
import { api } from "@/lib/api"
import * as THREE from "three"

interface AvatarProps {
  isListening: boolean
  isSpeaking: boolean
  audioLevel: number
}

function Avatar({ isListening, isSpeaking, audioLevel }: AvatarProps) {
  const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_URL || "/models/avatar-optimizado.glb"
  const gltf = useGLTF(avatarUrl)
  
  // Usar scene original (useGLTF cachea correctamente, no hay problema de reutilización)
  const { scene, animations } = gltf
  
  const groupRef = useRef<THREE.Group>(null)
  const avatarHeadRef = useRef<THREE.SkinnedMesh | null>(null)
  const [mouthOpenIndex, setMouthOpenIndex] = useState<number>(-1)
  const [avatarRoot, setAvatarRoot] = useState<THREE.Object3D | null>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  
  // Referencias para animación de brazo derecho
  const rightShoulderRef = useRef<THREE.Bone | null>(null)
  const rightArmRef = useRef<THREE.Bone | null>(null)
  const rightForeArmRef = useRef<THREE.Bone | null>(null)
  
  // Animación de zoom al aparecer
  const zoomScaleRef = useRef(4.5) // Iniciar con zoom cercano
  const zoomPositionYRef = useRef(6.0) // 🔺 INICIO: Valor alto = parte superior cabeza | Aumenta para subir más
  const zoomCompleteRef = useRef(false)

  useEffect(() => {
    console.log('🔍 Analizando MetaPerson avatar...')
    
    // Resetear transformaciones del scene para empezar limpio
    scene.position.set(0, 0, 0)
    scene.rotation.set(0, 0, 0)
    scene.scale.set(1, 1, 1)
    console.log('🔄 Scene reseteado a transformaciones default')
    
    // Buscar AvatarRoot (estructura de MetaPerson)
    const root = scene.getObjectByName("AvatarRoot")
    if (root) {
      console.log('✅ AvatarRoot encontrado')
      setAvatarRoot(root)
    } else {
      console.warn('⚠️ AvatarRoot no encontrado, usando scene directamente')
      setAvatarRoot(scene)
    }
    
    // Buscar específicamente AvatarHead (tiene los 66 morph targets)
    let avatarHead: THREE.SkinnedMesh | null = null
    
    scene.traverse((child) => {
      // Buscar AvatarHead específicamente
      if (child.name === "AvatarHead" && child instanceof THREE.SkinnedMesh) {
        avatarHead = child
        avatarHeadRef.current = child
        console.log('✅ AvatarHead encontrado')
      }
      
      // Buscar huesos del brazo derecho para animación de gestos
      if (child instanceof THREE.Bone) {
        const boneName = child.name.toLowerCase()
        
        // Hombro derecho
        if (boneName.includes('rightshoulder') || boneName.includes('right_shoulder')) {
          rightShoulderRef.current = child
          console.log('✅ Hombro derecho encontrado:', child.name)
        }
        
        // Brazo derecho (upper arm)
        if (boneName.includes('rightarm') || boneName.includes('right_arm') || 
            boneName.includes('rightupperarm') || boneName.includes('right_upper_arm')) {
          if (!boneName.includes('forearm')) {
            rightArmRef.current = child
            console.log('✅ Brazo derecho encontrado:', child.name)
          }
        }
        
        // Antebrazo derecho (forearm)
        if (boneName.includes('rightforearm') || boneName.includes('right_forearm')) {
          rightForeArmRef.current = child
          console.log('✅ Antebrazo derecho encontrado:', child.name)
        }
      }
      
      // Con animación Idle ya no necesitamos rotar brazos manualmente
      // La pose natural viene de la animación
      
      // Configurar materiales
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        // Configurar materiales para mejor visibilidad
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat: any) => {
            if (mat) {
              // DEBUG: Ver valores originales del GLB para materiales de ojos
              if (child.name && (child.name.includes('Eye') || child.name.includes('eye'))) {
                console.log('👁️ Material original del GLB:', {
                  meshName: child.name,
                  materialName: mat.name,
                  hasMap: !!mat.map,
                  mapName: mat.map?.name || 'sin textura',
                  color: mat.color ? `rgb(${(mat.color.r*255).toFixed(0)}, ${(mat.color.g*255).toFixed(0)}, ${(mat.color.b*255).toFixed(0)})` : 'sin color',
                  colorHex: mat.color?.getHexString(),
                  opacity: mat.opacity,
                  transparent: mat.transparent
                })
              }
              
              // NO MODIFICAR NADA - El modelo viene correctamente configurado del GLB
              // Solo forzar actualización para asegurar que se renderice
              mat.needsUpdate = true
              
              console.log('🎨 Material cargado:', mat.name || 'Sin nombre', '- Map:', !!mat.map)
            }
          })
        }
        
        if (child.name === "AvatarHead" && child.morphTargetDictionary && child.morphTargetInfluences) {
          const morphNames = Object.keys(child.morphTargetDictionary)
          
          console.log('🎭 Morph targets en AvatarHead (' + morphNames.length + '):', morphNames)
          
          // Buscar jawOpen específicamente (MetaPerson usa jawOpen)
          const mouthIndex = child.morphTargetDictionary['jawOpen']
          
          if (mouthIndex !== undefined && mouthIndex !== -1) {
            setMouthOpenIndex(mouthIndex)
            console.log('✅ jawOpen encontrado en índice:', mouthIndex)
          } else {
            console.error('❌ jawOpen no encontrado en morph targets')
            console.log('Morph targets disponibles:', morphNames)
          }
        }
      }
    })
    
    if (!avatarHeadRef.current) {
      console.error('❌ No se encontró AvatarHead con morph targets')
    } else {
      console.log('✅ Avatar configurado correctamente')
    }
    
    // Configurar animaciones (Idle)
    if (animations && animations.length > 0) {
      console.log('🎬 Animaciones detectadas:', animations.length)
      animations.forEach((anim, index) => {
        console.log(`  [${index}] ${anim.name} - Duración: ${anim.duration.toFixed(2)}s, Tracks: ${anim.tracks.length}`)
      })
      
      // Limpiar mixer existente si hay uno (por si acaso)
      if (mixerRef.current) {
        console.log('⚠️ Limpiando mixer anterior antes de crear uno nuevo')
        mixerRef.current.stopAllAction()
        mixerRef.current = null
      }
      
      // Crear AnimationMixer fresco
      const mixer = new THREE.AnimationMixer(scene)
      mixerRef.current = mixer
      console.log('🎭 Mixer creado y asignado')
      
      // Silenciar warnings de PropertyBinding en consola (no afectan funcionalidad)
      const originalWarn = console.warn
      console.warn = (...args) => {
        if (args[0]?.includes && args[0].includes('PropertyBinding')) {
          // Ignorar warnings de PropertyBinding
          return
        }
        originalWarn.apply(console, args)
      }
      
      // Buscar y reproducir animación Idle SIN filtrar tracks
      const idleAnimation = animations.find(anim => 
        anim.name.toLowerCase().includes('idle')
      ) || animations[0]
      
      if (idleAnimation) {
        try {
          const action = mixer.clipAction(idleAnimation)
          action.reset() // Resetear action por si tiene estado previo
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.clampWhenFinished = false
          action.play()
          console.log('▶️ Animación Idle REPRODUCIENDO:', idleAnimation.name, '- Running:', action.isRunning(), '- Paused:', action.paused)
        } catch (error) {
          console.error('❌ Error reproduciendo animación:', error)
        }
      }
      
      // Restaurar console.warn después de un momento
      setTimeout(() => {
        console.warn = originalWarn
      }, 1000)
    } else {
      console.warn('⚠️ No se encontraron animaciones en el modelo')
    }

    // Cleanup del mixer cuando el componente se desmonte
    return () => {
      console.log('🧹 Limpiando componente Avatar...')
      
      // Detener todas las animaciones y resetear skeleton
      if (mixerRef.current) {
        mixerRef.current.stopAllAction()
        
        // Resetear skeleton a bind pose para que el próximo mount empiece limpio
        scene.traverse((child) => {
          if ((child as any).isSkinnedMesh) {
            const skinnedMesh = child as THREE.SkinnedMesh
            if (skinnedMesh.skeleton) {
              skinnedMesh.skeleton.pose()
            }
          }
        })
        
        mixerRef.current = null
      }
      
      // Limpiar referencias
      avatarHeadRef.current = null
      setAvatarRoot(null)
      setMouthOpenIndex(-1)
      
      console.log('✅ Avatar limpiado y skeleton reseteado')
    }
  }, [scene, animations, avatarUrl])

  // Log de escala y posición al montar
  useEffect(() => {
    console.log('📐 Scene - Scale:', scene.scale.toArray(), '- Position:', scene.position.toArray(), '- Visible:', scene.visible)
  }, [scene])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    
    // Animación de zoom al aparecer (solo una vez)
    if (!zoomCompleteRef.current && groupRef.current) {
      const targetScale = 3.0
      const targetPositionY = -4.85 // 🔻 FINAL: Valor bajo = cintura | Disminuye para terminar más bajo
      const zoomSpeed = 0.8 // ⏱️ VELOCIDAD: 0.5=lento, 1.5=rápido
      
      // Interpolar suavemente hacia la escala objetivo
      zoomScaleRef.current = THREE.MathUtils.lerp(
        zoomScaleRef.current,
        targetScale,
        delta * zoomSpeed
      )
      
      // Interpolar posición Y (desde cara hasta cuerpo completo)
      zoomPositionYRef.current = THREE.MathUtils.lerp(
        zoomPositionYRef.current,
        targetPositionY,
        delta * zoomSpeed
      )
      
      // Aplicar escala y posición al grupo
      groupRef.current.scale.setScalar(zoomScaleRef.current)
      groupRef.current.position.y = zoomPositionYRef.current
      
      // Marcar como completo cuando esté muy cerca del objetivo
      if (Math.abs(zoomScaleRef.current - targetScale) < 0.01) {
        zoomScaleRef.current = targetScale
        zoomPositionYRef.current = targetPositionY
        groupRef.current.scale.setScalar(targetScale)
        groupRef.current.position.y = targetPositionY
        zoomCompleteRef.current = true
        const recorrido = (6.0 - targetPositionY).toFixed(2)
        console.log(`✅ Zoom completado - Recorrido: ${recorrido} unidades (Inicio: 6.0 → Final: ${targetPositionY})`)
      }
    }
    
    // Actualizar AnimationMixer (para reproducir animación Idle)
    if (mixerRef.current) {
      mixerRef.current.update(delta)
      
      // Log de debug cada 5 segundos
      if (Math.floor(time) % 5 === 0 && Math.floor(time * 10) % 10 === 0) {
        console.log('🔄 Mixer actualizando - delta:', delta.toFixed(4), '- time:', time.toFixed(2))
      }
    } else {
      // Advertencia si el mixer no existe
      if (Math.floor(time) === 2 && Math.floor(time * 10) % 10 === 0) {
        console.warn('⚠️ mixerRef.current es null en useFrame')
      }
    }

    // Animación de "escuchando" (solo después de completar zoom)
    if (zoomCompleteRef.current && groupRef.current && isListening && !isSpeaking) {
      groupRef.current.rotation.x = Math.sin(time * 2) * 0.03
      groupRef.current.position.y = -4.85 + Math.sin(time * 3) * 0.02
    } else if (zoomCompleteRef.current && groupRef.current && !isSpeaking) {
      groupRef.current.rotation.x *= 0.95
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -4.85,
        0.1
      )
    }

    // Animación de "hablando" con morph targets jawOpen
    if (isSpeaking && avatarHeadRef.current && mouthOpenIndex !== -1) {
      const influences = avatarHeadRef.current.morphTargetInfluences
      
      if (influences) {
        // Calcular intensidad de apertura de boca basada en audioLevel REAL de ElevenLabs
        const baseIntensity = audioLevel * 1.4 // Amplificación aumentada (140%)
        const variation = Math.sin(time * 18) * 0.08 // Variación natural más visible
        const smoothing = Math.sin(time * 25) * 0.05 // Suavizado adicional
        
        const totalIntensity = Math.min(0.9, Math.max(0, baseIntensity + variation + smoothing)) // Máximo 90%
        
        // Aplicar al jawOpen (índice del morph target)
        influences[mouthOpenIndex] = totalIntensity
        
        // Log para debug
        if (Math.floor(time * 5) % 10 === 0) {
          console.log('🗣️ HABLANDO - jawOpen[' + mouthOpenIndex + ']:', totalIntensity.toFixed(3), 'audioLevel:', audioLevel.toFixed(2))
        }
      } else {
        console.warn('⚠️ morphTargetInfluences es null en AvatarHead')
      }
    } else if (avatarHeadRef.current && mouthOpenIndex !== -1) {
      // Cerrar boca suavemente cuando no está hablando
      const influences = avatarHeadRef.current.morphTargetInfluences
      if (influences && influences[mouthOpenIndex] > 0) {
        influences[mouthOpenIndex] *= 0.85 // Decay suave
      }
    }

    // 🤚 ANIMACIÓN DE BRAZO DERECHO mientras habla (señalando cursos abajo)
    if (isSpeaking && rightArmRef.current) {
      // Intensidad del gesto basada en el volumen de voz (más sutil)
      const gestureIntensity = audioLevel * 0.25 // 25% del volumen (más suave)
      
      // Movimiento de presentación: señalar hacia abajo mostrando cursos
      // Rotación en Z (apertura del brazo - MÁS CERRADO)
      rightArmRef.current.rotation.z = 0.15 + Math.sin(time * 1.5) * (0.1 + gestureIntensity * 0.3)
      
      // Rotación en X (apuntar hacia ABAJO)
      rightArmRef.current.rotation.x = 0.6 + Math.sin(time * 1.8) * (0.1 + gestureIntensity * 0.2)
      
      // Rotación en Y (movimiento izquierda-derecha al presentar)
      rightArmRef.current.rotation.y = Math.sin(time * 1.2) * (0.2 + gestureIntensity * 0.3)
      
      // Si existe el antebrazo, rotar palma hacia afuera
      if (rightForeArmRef.current) {
        // Palma rotada hacia afuera, gesto de mostrar
        rightForeArmRef.current.rotation.y = -0.8 + Math.sin(time * 1.5) * (0.15 + gestureIntensity * 0.2)
        
        // Ligera flexión del codo
        rightForeArmRef.current.rotation.z = -0.4 + Math.sin(time * 2) * 0.1
      }
      
      // Log ocasional para debug
      if (Math.floor(time * 2) % 10 === 0) {
        console.log('👇 Señalando cursos - Intensidad:', gestureIntensity.toFixed(2), 'X:', rightArmRef.current.rotation.x.toFixed(2))
      }
    } else if (rightArmRef.current) {
      // Volver suavemente a la posición idle (decay)
      rightArmRef.current.rotation.z *= 0.92
      rightArmRef.current.rotation.x *= 0.92
      rightArmRef.current.rotation.y *= 0.92
      
      if (rightForeArmRef.current) {
        rightForeArmRef.current.rotation.y *= 0.92
        rightForeArmRef.current.rotation.z *= 0.92
      }
    }
  })

  return (
    <group ref={groupRef}>
      <primitive
        object={scene}
        scale={1.0}
        position={[0, -3.5, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  )
}

// Precargar el modelo para evitar delays en el loader
useGLTF.preload(process.env.NEXT_PUBLIC_AVATAR_URL || "/models/avatar-optimizado.glb")

function AvatarLoader() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#F97316" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 2, 32]} />
        <meshStandardMaterial color="#F97316" opacity={0.4} transparent wireframe />
      </mesh>
    </group>
  )
}

export default function HeroAvatar() {
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [aiMessage, setAiMessage] = useState("")
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  // Usar timestamp único para forzar re-render del Canvas en cada mount
  const [canvasKey, setCanvasKey] = useState(Date.now())
  // Estados para sistema híbrido de audio (iOS compatible)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [pendingAudio, setPendingAudio] = useState<string | null>(null)
  // Estado para fallback a Web Speech API si ElevenLabs falla
  const [showWebSpeechButton, setShowWebSpeechButton] = useState(false)
  const [fallbackMessage, setFallbackMessage] = useState<string>('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  // Generar nueva key cada vez que se monte el componente
  useEffect(() => {
    const newKey = Date.now()
    console.log('🔄 HeroAvatar montado - Generando nueva Canvas key:', newKey)
    setCanvasKey(newKey)
  }, [])

  // Cleanup cuando el componente se desmonte
  useEffect(() => {
    return () => {
      console.log('🧹 Limpiando componente HeroAvatar...')
      
      // Limpiar intervalos
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current)
        audioIntervalRef.current = null
      }
      
      // Detener y limpiar audio si está reproduciendo
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.src = ''
        audioElementRef.current = null
      }
      
      // Cerrar contexto de audio
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => {
          console.warn('Error cerrando AudioContext:', err)
        })
        audioContextRef.current = null
      }
      
      // Limpiar analyser
      analyserRef.current = null
      
      // Cancelar Web Speech API (fallback)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      
      console.log('✅ Limpieza completa')
    }
  }, [])

  // Función para reproducir audio desde ElevenLabs (viene del backend)
  const playAudioFromBackend = (audioBase64: string) => {
    console.log('🎵 Reproduciendo audio de ElevenLabs')
    
    try {
      // Convertir base64 a blob
      const audioData = atob(audioBase64)
      const arrayBuffer = new Uint8Array(audioData.length)
      for (let i = 0; i < audioData.length; i++) {
        arrayBuffer[i] = audioData.charCodeAt(i)
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)

      // Crear elemento de audio
      const audio = new Audio(audioUrl)
      audioElementRef.current = audio

      // Crear o reutilizar contexto de audio para análisis
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('🎧 AudioContext creado/recreado')
      }

      // Reanudar el AudioContext si está suspendido
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
        console.log('▶️ AudioContext reanudado')
      }

      const audioContext = audioContextRef.current
      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Evento cuando empieza a reproducir
      audio.onplay = () => {
        console.log('🎤 Audio ElevenLabs reproduciendo')
        setIsSpeaking(true)

        // Analizar nivel de audio en tiempo real
        const updateAudioLevel = () => {
          if (!analyserRef.current || !isSpeaking) return

          analyserRef.current.getByteFrequencyData(dataArray)
          
          // Calcular nivel promedio (enfocado en frecuencias de voz: 85-255 Hz aprox)
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i]
          }
          const average = sum / bufferLength
          const normalizedLevel = average / 255 // 0-1

          setAudioLevel(normalizedLevel)
          
          if (audio && !audio.paused) {
            requestAnimationFrame(updateAudioLevel)
          }
        }

        updateAudioLevel()
      }

      // Evento cuando termina
      audio.onended = () => {
        console.log('🎤 Audio ElevenLabs finalizado')
        setIsSpeaking(false)
        setAudioLevel(0)
        URL.revokeObjectURL(audioUrl)
      }

      // Manejar errores
      audio.onerror = (e) => {
        console.error('❌ Error reproduciendo audio:', e)
        setIsSpeaking(false)
        setAudioLevel(0)
      }

      // Reproducir
      audio.play().catch(err => {
        console.error('Error al reproducir:', err)
        setIsSpeaking(false)
      })

    } catch (error) {
      console.error('Error procesando audio:', error)
      setIsSpeaking(false)
    }
  }

  // Función para usar Text-to-Speech (FALLBACK - ya no se usa por defecto)
  const speakMessage = (message: string) => {
    console.log('🎬 INICIANDO SPEAK MESSAGE')
    console.log('📝 Mensaje a hablar:', message)
    
    // Verificar si el navegador soporta Web Speech API
    if (!('speechSynthesis' in window)) {
      console.warn('Tu navegador no soporta Text-to-Speech')
      return
    }

    // Cancelar cualquier voz en curso
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(message)
    
    // Configuración de la voz
    utterance.lang = 'es-ES' // Español
    utterance.rate = 0.9 // Velocidad (0.1 a 10)
    utterance.pitch = 1.0 // Tono (0 a 2)
    utterance.volume = 1.0 // Volumen (0 a 1)

    // Seleccionar voz en español si está disponible
    const voices = window.speechSynthesis.getVoices()
    const spanishVoice = voices.find(voice => voice.lang.includes('es'))
    if (spanishVoice) {
      utterance.voice = spanishVoice
    }

    // Eventos de la voz
    utterance.onstart = () => {
      console.log('🎤 Iniciando voz...')
      console.log('🔊 Activando isSpeaking=true')
      setIsSpeaking(true)
      
      // Simular variación de audioLevel mientras habla (REDUCIDO para apertura más sutil)
      audioIntervalRef.current = setInterval(() => {
        // Generar nivel aleatorio entre 0.15 y 0.45 para movimiento de boca más natural
        const level = 0.15 + Math.random() * 0.3
        setAudioLevel(level)
        console.log('📊 AudioLevel actualizado:', level.toFixed(2))
      }, 100) // Actualizar cada 100ms
    }

    utterance.onend = () => {
      console.log('🎤 Voz finalizada')
      setIsSpeaking(false)
      setAudioLevel(0)
      
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current)
      }
    }

    utterance.onerror = (event) => {
      console.error('Error en TTS:', event)
      setIsSpeaking(false)
      setAudioLevel(0)
      
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current)
      }
    }

    // Reproducir la voz
    console.log('🔊 Ejecutando speechSynthesis.speak()')
    window.speechSynthesis.speak(utterance)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setIsListening(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsListening(false)
    }, 1000)
  }

  // 🔧 Sistema híbrido de audio (Opción C): Intenta autoplay, si falla muestra botón
  const tryAutoplay = async (audioBase64: string) => {
    console.log('🎵 Intentando autoplay de audio...')
    
    try {
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`
      const audio = new Audio(audioUrl)
      audioElementRef.current = audio

      // Crear o reutilizar contexto de audio para análisis
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('🎧 AudioContext creado para autoplay')
      }

      // Intentar reanudar AudioContext (crítico para iOS)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
        console.log('▶️ AudioContext reanudado')
      }

      const audioContext = audioContextRef.current
      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Evento cuando empieza a reproducir
      audio.onplay = () => {
        console.log('✅ Autoplay exitoso - Audio reproduciendo')
        setIsSpeaking(true)
        setShowPlayButton(false) // Ocultar botón si autoplay funcionó
        setPendingAudio(null)

        // Analizar nivel de audio en tiempo real
        const updateAudioLevel = () => {
          if (!analyserRef.current || !isSpeaking) return

          analyserRef.current.getByteFrequencyData(dataArray)
          
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i]
          }
          const average = sum / bufferLength
          const normalizedLevel = average / 255

          setAudioLevel(normalizedLevel)
          
          if (audio && !audio.paused) {
            requestAnimationFrame(updateAudioLevel)
          }
        }

        updateAudioLevel()
      }

      audio.onended = () => {
        console.log('🎤 Audio finalizado')
        setIsSpeaking(false)
        setAudioLevel(0)
      }

      audio.onerror = (err) => {
        console.error('❌ Error en reproducción de audio:', err)
        setIsSpeaking(false)
        setAudioLevel(0)
      }

      // 🚀 Intentar reproducir (aquí puede fallar en iOS)
      await audio.play()
      
    } catch (error) {
      // ⚠️ Autoplay bloqueado (iOS o política del navegador)
      console.warn('⚠️ Autoplay bloqueado por el navegador:', error)
      console.log('📱 Mostrando botón manual para reproducción')
      setShowPlayButton(true)
      setPendingAudio(audioBase64)
    }
  }

  // 🔘 Reproducir audio manualmente (llamado desde botón)
  const playManually = async (audioBase64: string) => {
    console.log('🎵 Reproducción manual iniciada por usuario (ElevenLabs)')
    setShowPlayButton(false)
    setPendingAudio(null)

    let audioContext: AudioContext | null = null

    try {
      // 🔑 IMPORTANTE: Este código se ejecuta DENTRO del evento onClick del botón
      // Por eso cuenta como "interacción del usuario" y NO es bloqueado por iOS
      const audioUrl = `data:audio/mp3;base64,${audioBase64}`
      const audio = new Audio(audioUrl)
      audioElementRef.current = audio

      // 🎧 AudioContext para lip sync (NUEVO contexto para evitar conflictos)
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log('🎧 Nuevo AudioContext creado para botón manual')

      // Reanudar si está suspendido (crítico para iOS)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
        console.log('▶️ AudioContext reanudado')
      }

      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      source.connect(analyser)
      analyser.connect(audioContext.destination)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Eventos del audio
      audio.onplay = () => {
        console.log('✅ Audio ElevenLabs reproduciendo desde botón manual')
        setIsSpeaking(true)

        const updateAudioLevel = () => {
          if (!analyserRef.current) return

          analyserRef.current.getByteFrequencyData(dataArray)
          
          let sum = 0
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i]
          }
          const average = sum / bufferLength
          const normalizedLevel = average / 255

          setAudioLevel(normalizedLevel)
          
          if (audio && !audio.paused) {
            requestAnimationFrame(updateAudioLevel)
          }
        }

        updateAudioLevel()
      }

      audio.onended = () => {
        console.log('🎤 Audio ElevenLabs finalizado')
        setIsSpeaking(false)
        setAudioLevel(0)
        // Cerrar contexto para liberar recursos
        audioContext?.close().catch(e => console.warn('Error cerrando context:', e))
      }

      audio.onerror = (err) => {
        console.error('❌ Error en audio ElevenLabs:', err)
        setIsSpeaking(false)
        setAudioLevel(0)
        audioContext?.close().catch(e => console.warn('Error cerrando context:', e))
      }

      // 🚀 Reproducir AHORA (dentro del evento de click = permitido por iOS)
      await audio.play()
      console.log('✅ ElevenLabs audio.play() ejecutado exitosamente')
      
    } catch (error) {
      console.error('❌ Error crítico en reproducción manual de ElevenLabs:', error)
      console.warn('⚠️ Activando fallback a Web Speech API')
      // 🔄 Si ElevenLabs falla, ofrecer Web Speech API como alternativa
      setShowWebSpeechButton(true)
      setIsSpeaking(false)
      setAudioLevel(0)
      audioContext?.close().catch(e => console.warn('Error cerrando context:', e))
    }
  }

  // 🔊 Reproducir con Web Speech API (fallback)
  const playWithWebSpeech = () => {
    console.log('🎙️ Usando Web Speech API como fallback')
    setShowWebSpeechButton(false)
    if (fallbackMessage) {
      speakMessage(fallbackMessage)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim()) return

    setIsLoading(true)
    setIsListening(false)
    setAiMessage("")
    setRecommendedCourses([])
    setShowPlayButton(false) // Reset del botón
    setPendingAudio(null)
    setShowWebSpeechButton(false) // Reset del botón de fallback
    setFallbackMessage('') // Reset del mensaje de fallback

    try {
      const response = await api.post<{
        message: string
        courses: any[]
        timestamp: string
        audio?: string // Audio en base64 desde ElevenLabs
      }>("/ai-agent/chat", {
        prompt: inputValue,
      })

      // Actualizar mensaje y cursos
      setAiMessage(response.message)
      setFallbackMessage(response.message) // Guardar para fallback Web Speech
      setRecommendedCourses(response.courses)
      
      // 🎵 Sistema híbrido: Intentar autoplay primero
      if (response.audio) {
        console.log('🎯 Audio ElevenLabs recibido del backend')
        console.log('📊 Tamaño del audio base64:', response.audio.length, 'caracteres')
        await tryAutoplay(response.audio) // Intenta autoplay, si falla muestra botón
      } else {
        console.warn('⚠️ No se recibió audio de ElevenLabs del backend')
        console.log('📢 Usando fallback (Web Speech API)')
        speakMessage(response.message)
      }
    } catch (error) {
      console.error("Error al comunicarse con el agente IA:", error)
      const errorMessage = "Lo siento, hubo un error al procesar tu solicitud. Intenta nuevamente."
      setAiMessage(errorMessage)
      console.log('⚠️ Error - usando fallback para mensaje de error')
      speakMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Ajustar altura del hero: compacto en móvil, expandido en desktop solo si hay cursos
  const heroClasses = recommendedCourses.length > 0 
    ? "py-8 md:min-h-screen container mx-auto px-4 text-center relative flex flex-col justify-center items-center"
    : "py-12 md:py-20 container mx-auto px-4 text-center relative flex flex-col justify-center items-center"

  return (
    <section className={heroClasses}>
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-sans mb-6 md:mb-8 leading-tight max-w-3xl mx-auto">
        ¿En qué quieres emprender? Dime cuáles son tus intereses
      </h1>

      {/* Contenedor del Avatar 3D - Optimizado para móviles */}
      <div className="relative w-[280px] h-[280px] min-[360px]:w-[320px] min-[360px]:h-[320px] sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] mx-auto mb-4 md:mb-6">
        <div className="w-full h-full relative glow-strong">
          <Canvas
            key={canvasKey} // Forzar re-render completo al navegar
            camera={{ position: [0, 0.4, 2.2], fov: 45 }}
            dpr={[1, 2]} // Limitar device pixel ratio para mejor performance en móviles
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 3, 5]} intensity={0.8} />
            <directionalLight position={[-2, 1, -2]} intensity={0.4} />
            <pointLight position={[0, 1, 3]} intensity={0.5} color="#ffffff" />
            
            <Suspense fallback={<AvatarLoader />}>
              <Avatar isListening={isListening} isSpeaking={isSpeaking} audioLevel={audioLevel} />
            </Suspense>
            
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              minDistance={1.5}
              maxDistance={15}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 1.8}
              panSpeed={0.5}
              zoomSpeed={0.8}
              rotateSpeed={0.5}
            />
          </Canvas>
        </div>
      </div>

      {/* Botón de reproducción manual ElevenLabs (solo aparece si autoplay falla) */}
      {showPlayButton && pendingAudio && (
        <div className="w-full max-w-xl mx-auto mb-4 px-4">
          <button
            onClick={() => playManually(pendingAudio)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 animate-pulse"
          >
            <span className="text-2xl">🔊</span>
            <span className="text-lg">Escuchar respuesta del avatar (ElevenLabs)</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Tu navegador bloqueó la reproducción automática. Haz clic para escuchar.
          </p>
        </div>
      )}

      {/* Botón fallback Web Speech API (solo si ElevenLabs falla) */}
      {showWebSpeechButton && fallbackMessage && (
        <div className="w-full max-w-xl mx-auto mb-4 px-4">
          <button
            onClick={playWithWebSpeech}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🎙️</span>
            <span className="text-lg">Escuchar con voz del navegador</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            El audio de alta calidad no está disponible. Usa la voz del navegador.
          </p>
        </div>
      )}

      {/* Input de búsqueda */}
      <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-8 px-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ejemplo: Me interesa emprendimiento, marketing digital..."
            value={inputValue}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1 px-4 py-3 md:py-4 text-base md:text-lg rounded-full border-2 border-orange-500 focus:border-orange-700 focus:ring-2 focus:ring-orange-500 bg-white text-black placeholder:text-gray-400"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 md:py-4 rounded-full disabled:opacity-50"
          >
            {isLoading ? "..." : "Buscar"}
          </Button>
        </div>
      </form>

      {/* Carrusel de cursos recomendados */}
      {recommendedCourses.length > 0 && (
        <CourseCarousel courses={recommendedCourses} />
      )}

      {/* Respuesta del Avatar (provisional - debajo del carrusel) */}
      {aiMessage && (
        <div className="w-full max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-700/20 border-2 border-orange-500 rounded-2xl p-4 md:p-6">
            <p className="text-white text-sm md:text-base leading-relaxed">
              <strong>Respuesta del asistente:</strong> {aiMessage}
            </p>
          </div>
        </div>
      )}

      {/* Botón para ver todos los cursos */}
      <Link href="/cursos" passHref>
        <Button className="bg-white text-black hover:bg-orange-700 hover:text-white transition-colors px-6 md:px-8 py-3 md:py-6 text-base md:text-lg rounded-full">
          Ver todos los cursos
        </Button>
      </Link>
    </section>
  )
}

// Precargar el modelo GLB para evitar problemas de navegación
const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_URL || "/models/avatar-optimizado.glb"
useGLTF.preload(avatarUrl)