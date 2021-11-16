# app_futbol
Aplicación para administrar una liga de futbol

Para poder ejecutar la aplicación se necesitará tener instalado NodeJS y MongoDB en el sistema

Puede instalar MongoDB en la siguiente URL
https://www.mongodb.com/try/download/enterprise

NodeJS:
https://nodejs.org/es/

Una vez que se cuente con NodeJS y MongoDB, colocar en la terminal el comando "npm install" que se encargará de 
de instalar todos los paquetes con los que cuenta la aplicación. 

Para iniciar la aplicación, ejecutar en la consola el comando "npm start" y esperar hasta que en la misma consola 
se imprima un mensaje con la leyenda "DB conected :)".

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
un link (checar en la carpeta de SPAM si no aparece en la carpeta de recibidos), este link deberá de redireccionar a una ruta donde se 
tengan que enviar los datos de la siguiente forma para crear un link de administrador:

POST http://localhost:3000/adminAuth/register/:token
Content-Type: application/json

{
    "email": "miguelrvg25@gmail.com",
    "password": "lalala123",
    "name": "miguel"
}

Los archivos "admin.http" y "teams.http" en la carpeta "request" tienen todas las rutas que actualmente se han desarrollado y un ejemplo de como debe de ser 
enviada la información necesaria al backend para ser procesada, al hacer click se devolverá la información que será enviada al frontend.

Las funciones para las planillas de partido, subir las imagenes de los escudos de los equipos y la autenticación de usuarios siguen en desarrollo :)
