let currentIndex = 1;
let registros = [];

async function enviarDatos() {
    const nombre = document.getElementById('nombre').value;
    const cargo = document.getElementById('cargo').value;
    const redSocial = document.getElementById('red_social').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const tema = document.getElementById('tema').value;
    const foto = document.getElementById('foto').files[0];

    if (!nombre || !cargo || !redSocial || !ubicacion || !tema || !foto) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('cargo', cargo);
    formData.append('red_social', redSocial);
    formData.append('ubicacion', ubicacion);
    formData.append('tema', tema);
    formData.append('foto', foto);

    try {
        const response = await fetch('http://localhost:3000/api/guardar', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Datos guardados correctamente');
            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
            document.getElementById('foto').value = '';
        } else {
            alert('Error al guardar los datos');
        }
    } catch (error) {
        console.error('Error al enviar datos:', error);
        alert('Hubo un problema al enviar los datos.');
    }
}

async function obtenerDatos() {
    try {
        const response = await fetch('http://localhost:3000/api/obtener-datos');
        if (!response.ok) {
            throw new Error('Error al obtener datos');
        }

        registros = await response.json();
        if (registros.length > 1) {
            mostrarRegistro(currentIndex);
            actualizarBotones();
        } else {
            alert("No hay registros disponibles para editar.");
            document.getElementById("anterior").disabled = true;
            document.getElementById("siguiente").disabled = true;
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        alert('Hubo un problema al cargar los datos.');
    }
}

function mostrarRegistro(index) {
    const registro = registros[index];
    if (!registro) {
        console.error('No se encontró el registro en el índice:', index);
        return;
    }

    document.getElementById('nombre').value = registro[0];
    document.getElementById('cargo').value = registro[1];
    document.getElementById('red_social').value = registro[2];
    document.getElementById('ubicacion').value = registro[3];
    document.getElementById('tema').value = registro[4];
    actualizarBotones();
}

function moverRegistro(direccion) {
    const newIndex = currentIndex + direccion;
    if (newIndex >= 1 && newIndex < registros.length) {
        currentIndex = newIndex;
        mostrarRegistro(currentIndex);
    }
    actualizarBotones();
}

function actualizarBotones() {
    document.getElementById("anterior").disabled = (currentIndex <= 1);
    document.getElementById("siguiente").disabled = (currentIndex >= registros.length - 1);
}

async function actualizarRegistro() {
    const nombre = document.getElementById('nombre').value;
    const cargo = document.getElementById('cargo').value;
    const redSocial = document.getElementById('red_social').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const tema = document.getElementById('tema').value;
    const foto = document.getElementById('foto').files[0];

    const formData = new FormData();
    formData.append('id', currentIndex);
    formData.append('nombre', nombre);
    formData.append('cargo', cargo);
    formData.append('red_social', redSocial);
    formData.append('ubicacion', ubicacion);
    formData.append('tema', tema);

    if (foto) {
        formData.append('foto', foto);
    }

    try {
        const response = await fetch('http://localhost:3000/api/actualizar-datos', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('Registro actualizado correctamente');
            obtenerDatos();
        } else {
            alert('Error al actualizar el registro');
        }
    } catch (error) {
        console.error('Error al actualizar registro:', error);
        alert('Hubo un problema al actualizar el registro.');
    }
}

if (window.location.pathname.includes('editar.html')) {
    obtenerDatos();
}
