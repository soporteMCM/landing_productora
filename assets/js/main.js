document.addEventListener("DOMContentLoaded", function () {
    const esPantallaMovil = window.innerWidth < 992
    const esDispTactil = "ontouchstart" in window || navigator.maxTouchPoints > 0

    const pageable = new Pageable("#container", {
        // Opciones de Pageable
        childSelector: "[data-anchor]", // Selector para las páginas
        pips: false, // Mostrar puntitos de navegación para referencia visual
        animation: 600, // Duración de la animación en ms
        orientation: "vertical", // Orientación de desplazamiento
        swipeThreshold: esPantallaMovil ? 30 : 100, // Umbral más bajo para móviles
        freeScroll: false, // Desactivar scroll libre para mejorar la navegación por secciones
        infinite: true, // Permitir navegación cíclica (poder volver al inicio desde la última sección)
        events: {
            mouse: true, // Habilitar clic para navegación
            wheel: true, // Habilitar rueda del ratón
            touch: true // Habilitar eventos táctiles en todos los dispositivos
        },
        onInit: function () {
            // Asegurarse de que los eventos están correctamente configurados al inicializar
            this.events.wheel = true
            this.events.mouse = true
            this.events.touch = true
        },
        onFinish: (data) => {
            document.querySelectorAll(".nav-link").forEach((link, index) => {
                if (index === data.index) link.classList.add("active")
                else link.classList.remove("active")
            })
        }
    })

    const contacto = document.querySelector("#contacto")

    // Manejo mejorado para formularios
    const deshabilitarEventosScroll = () => {
        if (pageable && pageable.events) {
            pageable.data.scrolling = false
            pageable.events.wheel = false
        }
    }

    const habilitarEventosScroll = () => {
        if (pageable && pageable.events) {
            setTimeout(() => {
                pageable.events.wheel = true
                pageable.data.scrolling = true
            }, 200) // Pequeño retraso para evitar eventos conflictivos
        }
    }

    // Eventos para el manejo del contacto en desktop
    contacto.addEventListener("mouseenter", deshabilitarEventosScroll)
    contacto.addEventListener("mouseleave", habilitarEventosScroll)

    // Eventos para el manejo del contacto en dispositivos táctiles
    contacto.addEventListener("touchstart", (e) => {
        // Solo deshabilitar si es un toque específico en un campo o botón del formulario
        if (e.target.closest(".form-control") || e.target.closest(".btn")) {
            deshabilitarEventosScroll()
        }
    })

    document.addEventListener("touchend", (e) => {
        // Habilitar el scroll cuando se suelta el dedo en la sección de contacto
        if (e.target.closest("#contacto")) {
            habilitarEventosScroll()
        }
    })

    const contactoFrm = document.getElementById("contactForm")
    contactoFrm.addEventListener("click", (e) => {
        e.stopPropagation()
    })

    contactoFrm.addEventListener("submit", (e) => {
        e.preventDefault()
        enviaConatacto(contacto)
    })

    // Añadir botón para volver al inicio desde la sección de contacto
    if (document.querySelector(".tarjeta-formulario-contacto")) {
        const backToTopBtn = document.createElement("button")
        backToTopBtn.classList.add("btn", "btn-outline-primary", "mt-3", "back-to-top-btn")
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Volver al inicio'
        backToTopBtn.addEventListener("click", function (e) {
            e.preventDefault()
            e.stopPropagation()
            pageable.scrollToPage(0)
        })

        document.querySelector(".tarjeta-formulario-contacto").appendChild(backToTopBtn)
    }

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault()
            const target = this.getAttribute("href").substring(1)
            pageable.scrollToAnchor(target)

            // Cerrar el menú móvil si está abierto
            const navbarCollapse = document.querySelector(".navbar-collapse")
            if (navbarCollapse && navbarCollapse.classList.contains("show")) {
                navbarCollapse.classList.remove("show")
            }
        })
    })

    document.querySelectorAll(".form-control").forEach((input) => {
        input.addEventListener("click", function (e) {
            e.stopPropagation()
        })

        input.addEventListener("touchstart", function (e) {
            e.stopPropagation()
        })

        input.addEventListener("focus", function (e) {
            // Deshabilitar temporalmente el scroll durante interacción con formularios
            if (pageable && pageable.events) {
                pageable.events.wheel = false
                pageable.events.touch = false
                pageable.data.scrolling = false
            }
        })

        input.addEventListener("blur", function (e) {
            // Pequeño retraso para evitar conflictos con otros eventos
            setTimeout(() => {
                if (pageable && pageable.events) {
                    pageable.events.wheel = true
                    pageable.events.touch = true
                    pageable.data.scrolling = true
                }
            }, 250)
        })
    })

    document.getElementById("telefono").addEventListener("keypress", soloNumeros)
    document.querySelector("#anio").textContent = new Date().getFullYear()

    // Mejorar soporte de swipe para dispositivos móviles
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        let startY = 0
        let startX = 0
        let endY = 0
        let endX = 0
        let startTime = 0
        let endTime = 0
        const swipeThreshold = 50 // Umbral para detectar un swipe
        const swipeTimeout = 300 // Tiempo máximo para un swipe (milisegundos)

        document.addEventListener(
            "touchstart",
            (e) => {
                // Solo registrar si no estamos en el formulario
                if (!e.target.closest(".form-control") && !e.target.closest("button")) {
                    startY = e.touches[0].clientY
                    startX = e.touches[0].clientX
                    startTime = new Date().getTime()
                }
            },
            { passive: true }
        )

        document.addEventListener(
            "touchmove",
            (e) => {
                // Evitar manejo de eventos de desplazamiento en elementos de formulario
                if (e.target.closest(".form-control") || e.target.closest("button")) {
                    return
                }

                // En la última sección, permitir el desplazamiento normal de la página
                const currentIndex = pageable.index
                const isLastPage =
                    currentIndex === document.querySelectorAll("[data-anchor]").length - 1

                if (!isLastPage && !e.target.closest("#contactForm")) {
                    e.preventDefault()
                }
            },
            { passive: false }
        )

        document.addEventListener(
            "touchend",
            (e) => {
                // No procesar eventos en elementos de formulario
                if (e.target.closest(".form-control") || e.target.closest("button")) {
                    return
                }

                endY = e.changedTouches[0].clientY
                endX = e.changedTouches[0].clientX
                endTime = new Date().getTime()

                const deltaY = startY - endY
                const deltaX = startX - endX
                const elapsedTime = endTime - startTime

                // Asegurarse de que es un swipe vertical y no horizontal
                // y que ocurrió en un tiempo razonable
                if (
                    Math.abs(deltaY) > Math.abs(deltaX) &&
                    Math.abs(deltaY) > swipeThreshold &&
                    elapsedTime < swipeTimeout
                ) {
                    const currentIndex = pageable.index
                    const isLastPage =
                        currentIndex === document.querySelectorAll("[data-anchor]").length - 1

                    if (deltaY > 0) {
                        // Swipe hacia arriba - avanzar a la siguiente página
                        if (!isLastPage) {
                            pageable.next()
                        }
                    } else {
                        // Swipe hacia abajo - volver a la página anterior
                        pageable.prev()
                    }
                }
            },
            { passive: true }
        )
    }

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
        document.body.removeChild(dialogo)
    })
    setTimeout(() => {
        document.querySelector("#contactForm").reset()
        document.querySelectorAll(".form-control").forEach((campo) => {
            campo.classList.remove("is-valid")
        })
        modal.hide()
    }, 3000)
    setTimeout(() => {
        document.body.removeChild(dialogo)
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

        const mapaSucursal = document.getElementById("mapa-sucursal")
        if (!mapaSucursal) return

        contenedorSucursales.innerHTML = ""

        data.sucursales.forEach((sucursal, index) => {
            const sucursalElement = document.createElement("div")
            sucursalElement.className = "sucursal-item"
            sucursalElement.textContent = sucursal.nombre

            sucursalElement.addEventListener("click", function () {
                document.querySelectorAll(".sucursal-item").forEach((el) => {
                    el.classList.remove("active")
                })

                this.classList.add("active")
                mapaSucursal.src = sucursal.ubicacion
            })

            if (index === 0) {
                sucursalElement.classList.add("active")
                mapaSucursal.src = sucursal.ubicacion
            }

            contenedorSucursales.appendChild(sucursalElement)
        })
    } catch (error) {
        console.error("Error al cargar las sucursales:", error)
    }
}
