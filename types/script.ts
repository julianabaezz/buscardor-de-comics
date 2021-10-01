const baseUrl: string = "https://gateway.marvel.com:443/v1/public/"
const apiKey: string = "21e9721ecd3caa5524429be6d8c1e57d"
const hash: string = "ec72458ece65a340f304d0411e0fe2a4"

const urlComics: string = `${baseUrl}comics?ts=1&apikey=${apiKey}&hash=${hash}&offset=${0}`
const urlCharacters: string = `${baseUrl}characters?ts=1&apikey=${apiKey}&hash=${hash}`

const params: URLSearchParams = new URLSearchParams(window.location.search)
const page = Number(params.get("page"))

const nextButton = document.getElementById("NextButton")
const backButton = document.getElementById("BackButton")
const comicList = document.getElementById("comicList")
const linkButton = document.getElementById("link")
const firstPageBtn = document.getElementById("firstPageBtn")
const lastPageBtn = document.getElementById("lastPageBtn")
const search = <HTMLInputElement>document.getElementById("search");	
const type = <HTMLInputElement>document.getElementById("type")
const orderBy = <HTMLInputElement>document.getElementById("orderBy")
const filterBtn = document.getElementById("filterBtn")

let limit = 20
let total = 0
let offset = page * limit

const comicsOrderBy = [
	"A-Z",
	"Z-A",
	"Más nuevo",
	"Más viejo"
]

const charactersOrderBy = [
	"A-Z",
	"Z-A",
]

const consultInfoParams = () => {
	const typeOrder = params.get("type")
	const order = params.get("orderBy")
	const title = params.get("titleStartsWith")
	if(typeOrder !== ""){
		type.value = typeOrder;	
	}
	if(order !== ""){
		orderBy.value = order
	}
	if(title !== ""){
		search.value = title
	}
}
consultInfoParams()


const createOptions = (type) => {
	orderBy.innerHTML = ""
	if(type === "comics"){
		comicsOrderBy.forEach(element => {
			const comicOption = document.createElement("option")
			const optionText = document.createTextNode(element)
			comicOption.appendChild(optionText);
			orderBy.appendChild(comicOption)
			
		})		
	}else{
		charactersOrderBy.forEach(element => {
			const characterOption = document.createElement("option")
			const optionText = document.createTextNode(element)
			characterOption.appendChild(optionText);
			orderBy.appendChild(characterOption)
			
		})
	}
	
}
createOptions(type.value)


//CREAR PÁGINA CON RESULTADOS DE BÚSQUEDA
const createTable = (comics) => {
	comicList.innerHTML = ""
	document.body.appendChild(comicList)
	comics.forEach((item, i) => {
		const Items = document.createElement("li")
		const itemsTitle = document.createTextNode(item.title)
		const itemsName = document.createTextNode(item.name)
		const itemsImg = document.createElement("img")
		const itemsDiv = document.createElement("div")
		itemsImg.src = `${item.thumbnail.path}.${item.thumbnail.extension}`
		const typeTitle = type.value === "comics" ? itemsTitle : itemsName
		itemsDiv.appendChild(typeTitle)
		itemsDiv.appendChild(itemsImg)
		Items.appendChild(itemsDiv)
		comicList.appendChild(Items)
	})

}
//BOTONES DE PÁGINAS
const nextPage = () => {
	if (!page) {
		params.set("page", JSON.stringify(2))
	} else {
		if (page < Math.round(total / limit)) {
			params.set("page", JSON.stringify(page + 1))
		}
	}
	window.location.href = "index.html?" + params

}

const backPage = () => {
	if (page) {
		params.set("page", JSON.stringify(page - 1))
		window.location.href = "index.html?" + params
	}
}

const firstPage = () => {
	params.set("page", JSON.stringify(1))
	window.location.href = "/index.html?" + params
}

const lastPage = () => {
	params.set("page", JSON.stringify(Math.round(total / limit)))
	window.location.href = "/index.html?" + params
}


const defaultOrder = (queryType, queryOrder) => {
	let orderValue;
	switch(queryType){
		case "comics":
			if (queryOrder === "Z-A") {
				orderValue = "-title"
			}else if(queryOrder === "Más nuevo"){
				orderValue = "-focDate"
			}else if(queryOrder === "Más viejo"){
				orderValue = "focDate"
			}else{
				orderValue = "title"
			}
			break;
		case "characters":
			if (queryOrder === "Z-A") {
				orderValue = "-name"
			}else{
				orderValue = "name"
			}
			break;
		}
		return orderValue
		
}

//FETCH
const fetchData = () => {
	const queryParams = new URLSearchParams(window.location.search)
	const selectType = queryParams.get("type") ? queryParams.get("type") : "comics"
	const order = defaultOrder(selectType, queryParams.get("orderBy"))
	const calcOffset = offset - limit === -limit ? 0 : offset - limit
	let url = `${baseUrl}${selectType}?ts=1&apikey=${apiKey}&hash=${hash}&offset=${calcOffset}&orderBy=${order}`;
	if(search.value !== ""){
		console.log(search.value)
		if(selectType === "comics"){
			url += `&titleStartsWith=${queryParams.get("titleStartsWith")}`
		}
		if(selectType === "characters"){
			url += `&nameStartsWith=${queryParams.get("nameStartsWith")}`
		}
	}

	return fetch(url)
		.then((response) => {
			return response.json()
		})
		.then((rta) => {
			const comics = rta.data.results
			limit = rta.data.limit
			total = rta.data.total
			createTable(comics)
			
		})
}

const init = async () => {
	await fetchData()
	disableBtns()
}

//DESHABILITAR BOTONES
const disableBtns = () => {
	if (!page || page === 1) {
		backButton.setAttribute("disabled", "true")
		firstPageBtn.setAttribute("disabled", "true")
	}
	if (page == Math.round(total / limit)) {
		nextButton.setAttribute("disabled", "true")
		lastPageBtn.setAttribute("disabled", "true")
	}
}

//FILTROS  
const filter = () => {
	offset = 0;
	// 1.Obtener datos de los inputs
	// const paramsObj: paramsObj = {
	// 	type: type.value,
	// 	orderBy: defaultOrder(type, orderBy.value),
	// }
	// paramsObj.type === "comics" ? paramsObj.title = search.value : paramsObj.name = search.value;

	const setParams: URLSearchParams = new URLSearchParams();
	setParams.set("type", type.value);
	setParams.set("orderBy", orderBy.value);
	
	if (search.value !== ""){
		type.value === "comics" ? setParams.set("titleStartsWith", search.value) : setParams.set("nameStartsWith", search.value);
	}

	window.location.href = "/index.html?" + setParams;



	


	// 2.Cambiar la url 
	// ¿¿??
	// 3. Generar url de la API
	
	// const urlApi = generateUrl(paramsObj);
	
	// 4. Hacer fetch
	// 5. Renderizar

}

init()

backButton.addEventListener('click', backPage)
nextButton.addEventListener('click', nextPage)
firstPageBtn.addEventListener('click', firstPage)
lastPageBtn.addEventListener('click', lastPage)
filterBtn.addEventListener('click', filter)
type.addEventListener('change', (e) => {
	createOptions(e.target.value)
})

	// fetch(urlCharacters)
	// .then((response) => {
   // 	return response.json()
	// })
	// .then((rta) => {
	// 	console.log(rta)
	// 	const characters = rta.data.results
    //     console.log(characters)

	// })