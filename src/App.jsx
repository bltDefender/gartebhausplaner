import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import './App.css'

const defaultTypes = [
  { id: '60x60', name: 'Pfosten 60 x 60', width: 60, height: 60, color: '#4caf50' },
  { id: '60x80', name: 'Balken 60 x 80', width: 60, height: 80, color: '#ff9800' },
]

const defaultForm = {
  typeId: defaultTypes[0].id,
  length: 240,
  x: 0,
  y: 30,
  z: 0,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
}

function Scene({ plate, timbers }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 5]} intensity={0.9} />
      <gridHelper args={[Math.max(plate.width, plate.depth) / 100, 20, '#6f6f6f', '#bdbdbd']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[plate.width / 100, plate.depth / 100]} />
        <meshStandardMaterial color="#d8d8d8" />
      </mesh>
      {timbers.map((timber) => (
        <mesh
          key={timber.id}
          position={[timber.x / 100, timber.y / 100, timber.z / 100]}
          rotation={[
            (timber.rotX * Math.PI) / 180,
            (timber.rotY * Math.PI) / 180,
            (timber.rotZ * Math.PI) / 180,
          ]}
        >
          <boxGeometry args={[timber.length / 100, timber.height / 100, timber.width / 100]} />
          <meshStandardMaterial color={timber.color} />
        </mesh>
      ))}
      <OrbitControls makeDefault />
    </>
  )
}

function App() {
  const [timberTypes, setTimberTypes] = useState(defaultTypes)
  const [timbers, setTimbers] = useState([])
  const [plate, setPlate] = useState({ width: 500, depth: 400 })
  const [selectedTypeId, setSelectedTypeId] = useState(defaultTypes[0].id)
  const [newType, setNewType] = useState({ name: '', width: 60, height: 60, color: '#2196f3' })
  const [form, setForm] = useState(defaultForm)

  const shoppingList = useMemo(() => {
    const grouped = timbers.reduce((acc, timber) => {
      const key = `${timber.width}x${timber.height}`
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(grouped).map(([crossSection, count]) => ({ crossSection, count }))
  }, [timbers])

  const selectedType = timberTypes.find((type) => type.id === form.typeId) ?? timberTypes[0]

  const createTimber = (type, values = form) => ({
    id: `timber-${Date.now()}-${Math.random()}`,
    typeId: type.id,
    width: type.width,
    height: type.height,
    color: type.color,
    length: Number(values.length),
    x: Number(values.x),
    y: Number(values.y),
    z: Number(values.z),
    rotX: Number(values.rotX),
    rotY: Number(values.rotY),
    rotZ: Number(values.rotZ),
  })

  const addType = (event) => {
    event.preventDefault()
    const width = Number(newType.width)
    const height = Number(newType.height)
    if (!width || !height) return

    const id = `${width}x${height}-${Date.now()}`
    const name = newType.name.trim() || `${width} x ${height}`
    const type = { id, name, width, height, color: newType.color }
    setTimberTypes((prev) => [...prev, type])
    setSelectedTypeId(type.id)
    setForm((prev) => ({ ...prev, typeId: type.id }))
  }

  const addTimber = (event) => {
    event.preventDefault()
    if (!selectedType) return

    setTimbers((prev) => [...prev, createTimber(selectedType)])
  }

  const addTimberFromType = (typeId) => {
    const type = timberTypes.find((item) => item.id === typeId)
    if (!type) return
    setTimbers((prev) => [...prev, createTimber(type)])
  }

  return (
    <main className="app">
      <header>
        <h1>Gartenhaus-Holzplaner</h1>
        <p>3D-Planung für Stützkonstruktionen mit cm-genauer Eingabe.</p>
      </header>

      <section className="layout">
        <aside className="panel">
          <h2>Grundplatte</h2>
          <div className="grid2">
            <label>
              Breite (cm)
              <input
                type="number"
                min="100"
                value={plate.width}
                onChange={(event) => setPlate((prev) => ({ ...prev, width: Number(event.target.value) }))}
              />
            </label>
            <label>
              Tiefe (cm)
              <input
                type="number"
                min="100"
                value={plate.depth}
                onChange={(event) => setPlate((prev) => ({ ...prev, depth: Number(event.target.value) }))}
              />
            </label>
          </div>

          <h2>Holz-Repository</h2>
          <form onSubmit={addType} className="stack">
            <label>
              Bezeichnung (optional)
              <input
                type="text"
                value={newType.name}
                onChange={(event) => setNewType((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="z. B. Riegel 60 x 80"
              />
            </label>
            <div className="grid2">
              <label>
                Breite (mm)
                <input
                  type="number"
                  min="10"
                  value={newType.width}
                  onChange={(event) => setNewType((prev) => ({ ...prev, width: Number(event.target.value) }))}
                />
              </label>
              <label>
                Höhe (mm)
                <input
                  type="number"
                  min="10"
                  value={newType.height}
                  onChange={(event) => setNewType((prev) => ({ ...prev, height: Number(event.target.value) }))}
                />
              </label>
            </div>
            <label>
              Farbe
              <input
                type="color"
                value={newType.color}
                onChange={(event) => setNewType((prev) => ({ ...prev, color: event.target.value }))}
              />
            </label>
            <button type="submit">Holztyp speichern</button>
          </form>

          <ul className="type-list">
            {timberTypes.map((type) => (
              <li
                key={type.id}
                draggable
                onDragStart={(event) => {
                  setSelectedTypeId(type.id)
                  setForm((prev) => ({ ...prev, typeId: type.id }))
                  event.dataTransfer.setData('text/plain', type.id)
                }}
              >
                <button
                  type="button"
                  className={selectedTypeId === type.id ? 'active' : ''}
                  onClick={() => {
                    setSelectedTypeId(type.id)
                    setForm((prev) => ({ ...prev, typeId: type.id }))
                  }}
                >
                  <span style={{ backgroundColor: type.color }} className="color-swatch" />
                  {type.name} ({type.width}x{type.height})
                </button>
              </li>
            ))}
          </ul>

          <h2>Auf Canvas platzieren</h2>
          <form
            onSubmit={addTimber}
            className="stack"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
          >
            <label>
              Gewählter Holztyp
              <select
                value={form.typeId}
                onChange={(event) => setForm((prev) => ({ ...prev, typeId: event.target.value }))}
              >
                {timberTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.width}x{type.height})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Länge (cm)
              <input
                type="number"
                min="1"
                value={form.length}
                onChange={(event) => setForm((prev) => ({ ...prev, length: event.target.value }))}
              />
            </label>
            <div className="grid3">
              <label>
                X (cm)
                <input
                  type="number"
                  value={form.x}
                  onChange={(event) => setForm((prev) => ({ ...prev, x: event.target.value }))}
                />
              </label>
              <label>
                Y (cm)
                <input
                  type="number"
                  value={form.y}
                  onChange={(event) => setForm((prev) => ({ ...prev, y: event.target.value }))}
                />
              </label>
              <label>
                Z (cm)
                <input
                  type="number"
                  value={form.z}
                  onChange={(event) => setForm((prev) => ({ ...prev, z: event.target.value }))}
                />
              </label>
            </div>
            <div className="grid3">
              <label>
                Rot X (°)
                <input
                  type="number"
                  value={form.rotX}
                  onChange={(event) => setForm((prev) => ({ ...prev, rotX: event.target.value }))}
                />
              </label>
              <label>
                Rot Y (°)
                <input
                  type="number"
                  value={form.rotY}
                  onChange={(event) => setForm((prev) => ({ ...prev, rotY: event.target.value }))}
                />
              </label>
              <label>
                Rot Z (°)
                <input
                  type="number"
                  value={form.rotZ}
                  onChange={(event) => setForm((prev) => ({ ...prev, rotZ: event.target.value }))}
                />
              </label>
            </div>
            <button type="submit">Holz hinzufügen</button>
          </form>

          <h2>Einkaufsliste</h2>
          <ul className="shopping-list">
            {shoppingList.length === 0 && <li>Noch keine Hölzer platziert.</li>}
            {shoppingList.map((item) => (
              <li key={item.crossSection}>
                {item.crossSection} mm: {item.count} Stück
              </li>
            ))}
          </ul>
        </aside>

        <section className="canvas-wrap">
          <Canvas
            camera={{ position: [5, 4, 5], fov: 50 }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const droppedTypeId = event.dataTransfer.getData('text/plain') || form.typeId
              addTimberFromType(droppedTypeId)
            }}
          >
            <Scene plate={plate} timbers={timbers} />
          </Canvas>
        </section>
      </section>
    </main>
  )
}

export default App
