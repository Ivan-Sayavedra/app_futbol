# app_futbol
Aplicación para administrar una liga de futbol

Para poder ejecutar la aplicación en su computadora se necesitará tener instalado NodeJS en el sistema

NodeJS:
https://nodejs.org/es/

Una vez que se cuente con NodeJS, colocar en la terminal el comando "npm install" que se encargará de 
de instalar todos los paquetes con los que cuenta la aplicación. 

*IMPORTANTE: dado que las variables de entorno no pueden ser expuestas al público (porque algunos servicios pueden dejar de funcionar una vez que se detecte que las claves de acceso han sido subidas) para que la aplicación pueda funcionar, se deberá agregar el archivo ".env"
y copiar ahí las variables de entorno en la carpeta principal de la aplicación.

Para iniciar la aplicación, ejecutar en la consola el comando "npm start" y esperar hasta que en la misma consola 
se imprima un mensaje con la leyenda "DB conected :)".

En la carpeta "Request" se encuentran una serie de archivos .http con todos los tipos de peticiones que se le pueden realizar al backend, si se desea mandar las peticiones desde estos archivos, es necesario tener instalada la extensión de VS Code "REST client", link de instalación:
https://marketplace.visualstudio.com/items?itemName=humao.rest-client

Cuando el usuario se registra o inicia sesión, se manda al frontend un token (JsonWebToken). Este token deberá de ser enviado de vuelta en cada una de las rutas donde se requiera que el usuario haya iniciado sesión con anterioridad como un header. A continuación se muestra un ejemplo de como deberá de ser enviado: 

fetch("http://localhost:3000/matches/delete-injuries/",{
    method: PATCH,
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    }
})

Debido a que la base de datos ya ha sido desplegada, se pueden usar los siguientes datos para realizar un Login dentro de la app:

POST http://localhost:3000/adminAuth/login
Content-Type: application/json

{
    "email": "usuario1@test.com",
    "password": "lalala123"
}

Lista de rutas que requieren autenticación:

GET http://localhost:3000/adminAuth - recuperar perfil de administrador
PUT http://localhost:3000/adminAuth - editar perfil de administrador
DELETE http://localhost:3000/adminAuth - eliminar perfil de administrador

POST http://localhost:3000/teams - crear equipo
DELETE http://localhost:3000/teams/:id - borrar un equipo
PATCH http://localhost:3000/teams/name - editar nombre de equipo
PATCH http://localhost:3000/teams/badge - cambiar imagen del escudo
PATCH http://localhost:3000/teams/add-player - añadir jugador a equipo
POST http://localhost:3000/teams/delete-player - eliminar jugador de equipo
PATCH http://localhost:3000/teams/edit-player - editar jugador
POST http://localhost:3000/teams/manager - añadir nuevo dt o cambiar actual dt

POST http://localhost:3000/matches - crear una planilla de partido
DELETE http://localhost:3000/matches/:id - borrar una planilla de partido
PATCH http://localhost:3000/matches/score/ - modificar los resultados
PATCH http://localhost:3000/matches/add-scorers/ - añadir goleador de un equipo en planilla de partido (modifica el balance de goles de los equipos y el resultado de los partidos)
PATCH http://localhost:3000/matches/delete-scorers/ - eliminar goleador de un equipo en planilla de partido (modifica el balance de goles de los equipos y el resultado de los partidos)
PATCH http://localhost:3000/matches/add-injuries/ - añadir jugador lesionado
PATCH http://localhost:3000/matches/delete-injuries/ - eliminar jugador lesionado
PATCH http://localhost:3000/matches/add-red-card/ - añadir tarjeta roja a un jugador en una planilla
PATCH http://localhost:3000/matches/delete-red-card/ - eliminar tarjeta roja a un jugador en una planilla
PATCH http://localhost:3000/matches/add-yellow-card/ - añadir tarjeta amarilla a un jugador en una planilla
PATCH http://localhost:3000/matches/delete-yellow-card/ - eliminar tarjeta amarilla a un jugador en una planilla


Para crear un perfil de administrador se necesita que su correo haya sido previamente registrado
como un email válido (solo se le permitirá el registro a las personas que ya se sepa que serán organizadores de
la liga). Para crear un email válido usar la siguiente ruta con el email dentro del body:


POST http://localhost:3000/authorizedAdmin
Content-Type: application/json

{
    "email": "miguelrvg25@gmail.com"
}

Una vez que el email se haya registrado, se podrá crear un perfil de administrador ingresando el email en la siguiente ruta:

POST http://localhost:3000/adminAuth
Content-Type: application/json

{
    "userEmail": "miguelrvg5@gmail.com"
}

Si se comprueba que el email es válido (si este está registrado en la base de datos anteriormente descrita) se enviará un email con
un código (checar en la carpeta de SPAM si no aparece en la carpeta de recibidos), este código deberá de ser registrado de la siguiente forma en la ruta
mostrada a continuación para así poder crear el perfil de administrador. (Por el momento el email no está siendo enviado debido a que la cuenta que se está 
usando para mandarlo con la API de Sendgrid aún no ha sido aprobada, por ello, el código se imprime en la pantalla, una vez que la cuenta sea aprobada los códigos empezarán a mandarse por correo) 

POST http://localhost:3000/adminAuth/register
Content-Type: application/json

{
    "token": "021789",
    "userName": "Miguelvg5",
    "password": "lala1234"
}

Cuando se crea un equipo, si no se añade ninguna imagen para el escudo del mismo se usará la imagen presente en la carpeta "images" como default. Si se pretende crear un equipo con una imagen de escudo, no se puede hacer una petición donde se mande información en formato JSON, se deberá de crear un nuevo FormData en el que se adjunte la información necesaria para la creación del equipo de la siguiente manera:

const formData = new FormData();
formData.append("name", name);
formData.append("players", players);
formData.append("manager", manager);
formData.append("image", image);

Posteriormente se podrá realizar la petición al backend:

fetch("POST http://localhost:3000/teams", {
    method: POST,
    body: formData,
    headers: {'Authorization': 'Bearer ' + token}
})






