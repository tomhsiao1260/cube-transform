import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'

// Dat GUI
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshNormalMaterial()
)

scene.add(cube)


// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 2)
camera.lookAt(new THREE.Vector3())
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// GUI
const parameters = {
    radius: 1.0,
    moveSpeed: 0.01,
    damping: 0.1,
    tilt: 10,
}

gui.add(parameters, 'moveSpeed').min(0.01).max(0.1).step(0.01)
gui.add(parameters, 'damping').min(0).max(1).step(0.01)
gui.add(parameters, 'tilt').min(0).max(10).step(0.1)

// Raycaster
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

// Desktop
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})
// Mobile
window.addEventListener('touchstart', (event) => {
    mouse.x = event.touches[0].clientX / sizes.width * 2 - 1
    mouse.y = - (event.touches[0].clientY / sizes.height) * 2 + 1
})

// Animate
const clock = new THREE.Clock()
let velocity = new THREE.Vector3()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    raycaster.setFromCamera(mouse, camera)

    // Ray direction vector
    const ray = raycaster.ray.direction
    // Calculate the displacement vector between the cube and the final location
    const xDelta = camera.position.clone()
                                  .add( ray.normalize() )
                                  .sub( new THREE.Vector3() )
                                  .normalize()
                                  .multiplyScalar( parameters.radius )
                                  .sub( cube.position )

    // Note: cube is always trapped inside an invisible sphere

    // Acceleration from the drag force
    const aDrag = xDelta.clone()
                        .multiplyScalar( parameters.moveSpeed )
    // Acceleration from the damping force
    const aDamp = velocity.clone()
                          .multiplyScalar( parameters.damping )

    // Change the velocity
    velocity = velocity.add( aDrag )
                       .sub( aDamp )

    // Move the cube
    cube.position.add( velocity )

    // Tilt the cube
    const {x, y, z} = velocity.clone().multiplyScalar( parameters.tilt )
    cube.rotation.set(-z, x, y)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()