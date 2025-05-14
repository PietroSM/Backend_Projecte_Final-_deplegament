# Imatge base
FROM node:20.19.1
# Crea un directori anomenat "app" en la ruta /usr/src/ amb l'opció -p per a asegurar que es
# creen tots els subdirectoris, inclòs si ja existeix.
RUN mkdir -p /usr/src/app
# Estableix la ruta de treball per a les següents instruccions.
WORKDIR /usr/src/app
# Copia els arxius que coincidexen amb el patró package*.json desde el sistema d'arxius
# del host fins el directori de treball actual del contenidor.
COPY package*.json ./
# Instal·la les dependènies de l'aplicació.
RUN npm install
# Copia tots els arxius i carpetes del directori actual en el sistem d'arxius del host
# aon s'està distribuient el contenidor Docker al directori de treball actual en el 
# contenidor.
COPY . .
# Indica que el contenidor escoltarà en el port 8080.
EXPOSE 8080
# Especifica el comando per defecte per a executar al initzialitzar el contenidor.
CMD ["npm", "start"]
