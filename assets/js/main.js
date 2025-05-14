document.addEventListener("DOMContentLoaded", function () {
    const isMobile = window.matchMedia("(max-width: 900px)").matches

    const pageable = new Pageable("#container", {
        // Opciones de Pageable
        childSelector: "[data-anchor]", // Selector para las páginas
        pips: false, // Mostrar/Ocultar los puntitos de navegación
        animation: 600, // Duración de la animación en ms
        orientation: "vertical", // Orientación de desplazamiento (horizontal o vertical)
        freeScroll: isMobile, // Permitir desplazamiento libre
        events: {
            mouse: false // Usar clic del mouse para navegar
        },
        onFinish: (data) => {
            document.querySelectorAll(".nav-link").forEach((link, index) => {
                if (index === data.index) link.classList.add("active")
                else link.classList.remove("active")
            })
        }
    })

    const sucursales = document.querySelector("#sucursales-lista")
    sucursales.addEventListener("touchstart", (e) => {
        e.stopPropagation()
    })

    sucursales.addEventListener("mouseenter", (e) => {
        pageable.events.wheel = false
    })

    sucursales.addEventListener("mouseleave", (e) => {
        pageable.events.wheel = true
    })

    sucursales.addEventListener("scroll", (e) => {
        e.stopPropagation()
    })

    const contactoFrm = document.getElementById("contactForm")
    contactoFrm.addEventListener("click", (e) => {
        e.stopPropagation()
    })

    contactoFrm.addEventListener("submit", (e) => {
        e.preventDefault()
        enviaConatacto(contacto)
    })

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault()
            const target = this.getAttribute("href").substring(1)
            pageable.scrollToAnchor(target)
        })
    })

    document.getElementById("telefono").addEventListener("keypress", soloNumeros)
    document.querySelector("#anio").textContent = new Date().getFullYear()

    cargarSucursales()
})

// Función para enviar el formulario de contacto
const enviaConatacto = (contacto) => {
    const nombre = document.getElementById("nombre")
    const telefono = document.getElementById("telefono")
    const email = document.getElementById("email")
    const mensaje = document.getElementById("mensaje")
    let valido = true

    if (nombre.value.trim() === "") {
        resaltarCampo(nombre, true)
        valido = false
    } else {
        resaltarCampo(nombre, false)
    }

    if (telefono.value.trim() === "") {
        resaltarCampo(telefono, true)
        valido = false
    } else {
        resaltarCampo(telefono, false)
    }

    if (email.value.trim() === "" || !validaEmail(email.value)) {
        resaltarCampo(email, true)
        valido = false
    } else {
        resaltarCampo(email, false)
    }

    if (mensaje.value.trim() === "") {
        resaltarCampo(mensaje, true)
        valido = false
    } else {
        resaltarCampo(mensaje, false)
    }

    if (valido) showExito()
}

// Función para asegurar la entrada de solo números en el campo de teléfono
const soloNumeros = (e) => {
    const key = e.key
    const isNumber = /^[0-9]$/.test(key)
    if (!isNumber && key !== "Backspace" && key !== "Delete") {
        e.preventDefault()
    }
}

// Función para validar el formato del email
const validaEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Función para mostrar el modal de éxito
const showExito = () => {
    const dialogo = document.createElement("div")
    dialogo.className = "modal fade"
    dialogo.id = "formSuccessModal"
    dialogo.tabIndex = "-1"
    dialogo.setAttribute("aria-labelledby", "formSuccessModalLabel")
    dialogo.setAttribute("aria-hidden", "true")
    dialogo.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="formSuccessModalLabel">Éxito</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Su mensaje ha sido enviado con éxito. Nos pondremos en contacto con usted pronto.
                </div>
            </div>
        </div>
    `
    document.body.appendChild(dialogo)
    const modal = new bootstrap.Modal(dialogo)

    modal.show()
    dialogo.addEventListener("hidden.bs.modal", () => {
        document.querySelector("#contactForm").reset()
        document.querySelectorAll(".form-control").forEach((campo) => {
            campo.classList.remove("is-valid")
        })
        if (dialogo) document.body.removeChild(dialogo)
    })
    setTimeout(() => {
        document.querySelector("#contactForm").reset()
        document.querySelectorAll(".form-control").forEach((campo) => {
            campo.classList.remove("is-valid")
        })
        modal.hide()
    }, 3000)
    setTimeout(() => {
        if (dialogo) document.body.removeChild(dialogo)
    }, 4000)
}

// Función para resaltar campos de formulario
const resaltarCampo = (campo, esError) => {
    if (esError) {
        campo.classList.add("is-invalid")
        campo.classList.remove("is-valid")
    } else {
        campo.classList.remove("is-invalid")
        campo.classList.add("is-valid")
    }
}

// Función para cargar sucursales desde JSON
const cargarSucursales = async () => {
    try {
        const response = await fetch("assets/data/sucursales.json")
        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo de sucursales")
        }
        const data = await response.json()

        const contenedorSucursales = document.getElementById("sucursales-lista")
        if (!contenedorSucursales) return

        // const mapaSucursal = document.getElementById("mapa-sucursal")
        // if (!mapaSucursal) return

        contenedorSucursales.innerHTML = ""

        data.sucursales.forEach((sucursal, index) => {
            const sucursalElement = document.createElement("div")
            sucursalElement.className = "sucursal-item"
            sucursalElement.textContent = sucursal.nombre
            // sucursalElement.addEventListener("click", function () {
            //     document.querySelectorAll(".sucursal-item").forEach((el) => {
            //         el.classList.remove("active")
            //     })

            //     this.classList.add("active")
            //     mapaSucursal.src = sucursal.ubicacion
            // })

            // if (index === 0) {
            //     sucursalElement.classList.add("active")
            //     mapaSucursal.src = sucursal.ubicacion
            // }

            contenedorSucursales.appendChild(sucursalElement)
        })
    } catch (error) {
        console.error("Error al cargar las sucursales:", error)
    }
}
