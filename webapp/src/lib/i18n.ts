/**
 * i18n propia y tipada (design D1). El diccionario español es la fuente de verdad:
 * `TranslationKey` se deriva de él, así que si otro idioma deja una clave sin
 * traducir, TypeScript falla en compilación en vez de mostrar un hueco en producción.
 *
 * Ojo: `UiLanguage` (idioma de la interfaz) NO es lo mismo que `CardLanguage`
 * (idioma de la carta, en/jp/zh-CN). Son conceptos distintos a propósito.
 */
export type UiLanguage = 'en' | 'es' | 'ca'

export const UI_LANGUAGES: { code: UiLanguage; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ca', label: 'Català' },
]

const es = {
  // Navegación
  'nav.catalog': 'Catálogo',
  'nav.collection': 'Colección',
  'nav.wishlist': 'Wishlist',
  'nav.trades': 'Trades',
  'nav.settings': 'Ajustes',
  'nav.scrollToTop': 'Ir arriba',
  'nav.scrollToBottom': 'Ir abajo',

  // Comunes
  'common.cancel': 'Cancelar',
  'common.create': 'Crear',
  'common.delete': 'Eliminar',
  'common.back': 'Volver',
  'common.select': 'Seleccionar',
  'common.selectAll': 'Todas',
  'common.selectNone': 'Ninguna',
  'common.add': 'Añadir',
  'common.remove': 'Quitar',
  'common.retry': 'Reintentar',
  'common.close': 'Cerrar',
  'common.onlyMissing': 'Solo faltantes',
  'common.ownershipAll': 'Todas',
  'common.ownershipOwned': 'En propiedad',
  'common.ownershipMissing': 'Faltantes',
  'common.viewList': 'Ver en lista',
  'common.viewGrid': 'Ver en cuadrícula',
  'common.searchInList': 'Buscar en esta lista…',
  'common.cards': 'cartas',
  'common.card_one': '{n} carta',
  'common.card_other': '{n} cartas',
  'common.unique_other': '{n} únicas',
  'common.copies_other': '{n} copias',
  'common.noData': 'sin datos',

  // Bienvenida
  'welcome.text':
    'Bienvenido a Gundam Tracker. Sin cuentas: tu colección, wishlist y listas de intercambio viven solo en este dispositivo.',
  'welcome.aboutLink': 'Sobre el proyecto (código abierto)',
  'welcome.dismiss': 'Cerrar aviso',

  // Catálogo
  'catalog.title': 'CATÁLOGO',
  'catalog.subtitle': '{n} cartas del Gundam Card Game',
  'catalog.subtitleEmpty': 'Todo el Gundam Card Game, en tu bolsillo',
  'catalog.searchPlaceholder': 'Buscar por nombre o número (ST01-001)…',
  'catalog.syncing': 'Sincronizando catálogo… {done}/{total}',
  'catalog.downloadTitle': 'Descarga el catálogo',
  'catalog.downloadBody':
    'Baja todas las expansiones del Gundam Card Game a este dispositivo para navegar y buscar incluso sin conexión.',
  'catalog.syncNow': 'Sincronizar ahora',
  'catalog.pendingExpansions': '{n} expansiones sin descargar',
  'catalog.download': 'Descargar',
  'catalog.newExpansions': '{n} expansiones nuevas disponibles — usa «Descargar» para bajarlas.',
  'catalog.noResultsFor': 'Sin resultados para «{q}».',
  'catalog.noResults': 'Sin resultados.',
  'catalog.truncated':
    'Mostrando los primeros {max} de {total} resultados — afina la búsqueda para ver el resto.',
  'catalog.selectN': 'Seleccionar las {n}',

  // Expansión
  'expansion.notDownloaded':
    'Esta expansión aún no está descargada. Vuelve al catálogo y pulsa «Descargar».',

  // Detalle de carta
  'card.notFound': 'Carta no encontrada en el catálogo local.',
  'card.minPrice': 'Precio mínimo (marketplace)',
  'card.offersAge': '{n} ofertas · {age}',
  'card.viewOnCardTrader': 'Ver en CardTrader',
  'card.priceByLanguage': 'Por idioma de carta',
  'card.moreOffers': 'hay más ofertas en CardTrader',
  'card.inWishlist': 'En wishlist',
  'card.toWishlist': 'A wishlist',
  'card.toTradeList': 'A lista de trade',
  'card.newList': 'Nueva lista',
  'card.addToCollection': 'Añadir a colección',
  'card.added': 'Añadida',
  'card.inYourCollection': 'En tu colección',
  'card.collections': 'Colecciones',
  'card.newCollection': 'Nueva',
  'card.collectionNamePlaceholder': 'Nombre (p. ej. Unit, Favoritas…)',
  'card.addCopy': 'Añadir una copia',
  'card.wishlistRemoveConfirm': 'Esta carta estaba en tu wishlist. ¿La quitamos?',
  'card.addedToWishlist': 'Añadida a wishlist',
  'card.removedFromWishlist': 'Quitada de wishlist',
  'card.addedToList': 'Añadida a la lista',
  'card.listFull': 'La lista está llena (máx. {max})',

  // Colección
  'collection.title': 'COLECCIÓN',
  'collection.unique': 'únicas',
  'collection.copies': 'copias',
  'collection.valuedBasis': 'basado en {n} de {m}',
  'collection.valuedFallback': '{n} con precio de otro idioma',
  'collection.refreshPrices': 'Actualizar precios',
  'collection.refreshing': 'Actualizando…',
  'collection.pricesUpdated': 'Precios actualizados',
  'collection.pricesFailed': 'No se pudieron actualizar los precios (¿sin conexión?)',
  'collection.allCards': 'Todas las cartas',
  'collection.myCollections': 'Mis colecciones',
  'collection.byExpansion': 'Por expansión',
  'collection.noCollectionCards': 'sin cartas',
  'collection.empty': 'Aún no tienes cartas. Añádelas desde el catálogo.',
  'collection.emptyLink': 'catálogo',
  'collection.allEmpty': 'Aún no tienes cartas en propiedad.',

  // Colecciones personalizadas
  'customCollection.deleteConfirm': '¿Eliminar la colección "{name}"?',
  'customCollection.deleteLabel': 'Eliminar colección',
  'customCollection.rename': 'Renombrar',
  'customCollection.empty': 'Aún no has añadido cartas. Hazlo desde el detalle de cualquier carta.',
  'customCollection.none':
    'Aún no tienes colecciones personalizadas. Créalas desde el detalle de cualquier carta.',
  'customCollection.createAndAdd': 'Crear y añadir',
  'customCollection.namePlaceholder': 'Nombre…',

  // Barra de selección masiva
  'bulk.selected': '{n} cartas seleccionadas',
  'bulk.exit': 'Salir del modo selección',
  'bulk.sectionOwned': 'Propiedad',
  'bulk.sectionWishlist': 'Wishlist',
  'bulk.sectionCollections': 'Colecciones',
  'bulk.sectionTrade': 'Intercambio',
  'bulk.addCopy': '+1 copia',
  'bulk.removeCopy': '−1 copia',
  'bulk.addToCollection': 'Añadir a colección',
  'bulk.removeFromThis': 'Quitar de esta',
  'bulk.addToWishlist': 'Añadir a wishlist',
  'bulk.addToTradeList': 'Añadir a lista de trade',
  'bulk.newCollection': 'Nueva colección',
  'bulk.newList': 'Nueva lista',
  'bulk.confirmRemoveCopy': '¿Restar una copia de {n} cartas? Las que no tengas se omiten.',
  'bulk.confirmRemoveWishlist': '¿Quitar {n} cartas de la wishlist?',
  'bulk.confirmRemoveCollection':
    '¿Quitar {n} cartas de esta colección? No afecta a tu propiedad.',
  'bulk.resultAddedCopies': '+1 copia en {n} cartas',
  'bulk.resultRemovedCopies': '−1 copia en {n} cartas',
  'bulk.resultNoneOwned': 'Ninguna tenía copias',
  'bulk.resultAddedWishlist': '{n} añadidas a wishlist',
  'bulk.resultAllInWishlist': 'Ya estaban todas en la wishlist',
  'bulk.resultRemovedWishlist': '{n} quitadas de la wishlist',
  'bulk.resultNoneInWishlist': 'Ninguna estaba en la wishlist',
  'bulk.resultAddedCollection': '{n} cartas añadidas',
  'bulk.resultAllInCollection': 'Ya estaban todas en esa colección',
  'bulk.resultRemovedCollection': '{n} cartas quitadas de la colección',
  'bulk.resultAddedTrade': '{n} cartas añadidas a la lista',
  'bulk.resultTradePartial': '{added} añadidas · {skipped} no caben (máx. {max})',
  'bulk.resultWishlistPartial': '{added} añadidas · {skipped} no caben (máx. {max})',

  // Wishlist
  'wishlist.title': 'WISHLIST',
  'wishlist.newList': 'Nueva lista',
  'wishlist.namePlaceholder': 'Nombre de la lista…',
  'wishlist.emptyLists':
    'Crea listas de hasta {max} cartas deseadas y compártelas con un enlace o QR — sin cuentas ni servidores.',
  'wishlist.myLists': 'Mis listas',
  'wishlist.listEmpty': 'Lista vacía. Añade cartas desde el detalle de cualquier carta.',
  'wishlist.collectionMatches': '{n} ya las tienes en tu colección',
  'wishlist.saveReceived': 'Guardar como lista recibida',
  'wishlist.sortName': 'Por nombre',
  'wishlist.sortExpansion': 'Por expansión',
  'wishlist.sortPrice': 'Por precio',
  'wishlist.estimatedCost': 'Coste estimado',
  'wishlist.basis': 'basado en {n} de {m} cartas con precio',
  'wishlist.empty': 'Tu wishlist está vacía. Marca cartas desde el catálogo.',

  // Trades
  'trades.title': 'TRADES',
  'trades.newList': 'Nueva lista',
  'trades.namePlaceholder': 'Nombre de la lista…',
  'trades.empty':
    'Crea listas de hasta {max} cartas para tradear y compártelas con un enlace o QR — sin cuentas ni servidores.',
  'trades.myLists': 'Mis listas',
  'trades.received': 'Recibidas',
  'trades.from': 'de {alias}',
  'trades.copyLink': 'Copiar enlace',
  'trades.qr': 'QR',
  'trades.exportFile': 'Exportar fichero',
  'trades.deleteConfirm': '¿Eliminar esta lista?',
  'trades.linkCopied': 'Enlace copiado',
  'trades.tooLong':
    'La lista es demasiado grande para un enlace. Usa el QR o «Exportar fichero».',
  'trades.listEmpty': 'Lista vacía. Añade cartas desde el detalle de cualquier carta que tengas.',
  'trades.unsyncedCard': 'carta no sincronizada',
  'trades.qrAlt': 'QR de la lista',
  'trades.sharedBy': 'Lista compartida por {alias}',
  'trades.shared': 'Lista compartida',
  'trades.wishlistMatches': '{n} coinciden con tu wishlist',
  'trades.unsyncedNotice':
    '{n} cartas pertenecen a expansiones que aún no has sincronizado: se muestran por su id. Sincroniza el catálogo para verlas completas.',
  'trades.saveReceived': 'Guardar como lista recibida',
  'trades.goToCatalog': 'Ir al catálogo',
  'trades.invalidLink': 'El enlace no contiene una lista válida (¿está cortado?).',

  // Ajustes
  'settings.title': 'AJUSTES',
  'settings.language': 'Idioma de la app',
  'settings.languageHint':
    'Solo afecta a la interfaz; el idioma de tus cartas se elige en cada copia.',
  'settings.catalog': 'Catálogo',
  'settings.catalogHint':
    'El catálogo y los precios se publican automáticamente desde CardTrader; nadie necesita iniciar sesión para usarlos.',
  'settings.publishedData': 'Datos publicados: {date} · {expansions} expansiones · {cards} cartas.',
  'settings.resync': 'Re-sincronizar todo',
  'settings.syncing': 'Sincronizando {done}/{total}…',
  'settings.customCollections': 'Colecciones personalizadas',
  'settings.customCollectionsHint':
    'Agrupa cartas como quieras (tipos, favoritas, arcos…) y úsalas como filtro en el catálogo y en tu colección.',
  'settings.backups': 'Copias de seguridad',
  'settings.backupsHint':
    'Se guarda una copia automática de colección, wishlist, listas de intercambio y colecciones personalizadas tras cada cambio (histórico de 5).',
  'settings.chooseFolder': 'Elegir carpeta de backups',
  'settings.folder': 'Carpeta: {name}',
  'settings.folderConfigured': 'Carpeta configurada',
  'settings.noFolderSupport':
    'Tu navegador no permite guardar en carpeta automáticamente: usa el export manual.',
  'settings.restore': 'Restaurar',
  'settings.exportImport': 'Exportar / importar',
  'settings.exportJson': 'Exportar JSON',
  'settings.importJson': 'Importar JSON',
  'settings.install': 'Instalar la app',
  'settings.installHint':
    'Instálala en este dispositivo para abrirla como una app, con icono propio y sin la barra del navegador.',
  'settings.installButton': 'Instalar app',
  'settings.installIosHint':
    'En iPhone/iPad, Apple no permite instalar desde un botón: toca el icono de Compartir de Safari y elige «Añadir a pantalla de inicio».',
  'settings.support': 'Apoya el proyecto',
  'settings.supportHint':
    'Gundam Tracker es gratis y seguirá siéndolo. Si te resulta útil, puedes invitarme a un café — totalmente opcional.',
  'settings.project': 'Proyecto',
  'settings.projectHint':
    'Gundam Tracker es de código abierto: aportaciones e informes de error son bienvenidos.',
  'settings.aboutLink': 'Acerca del proyecto y repositorio',
  'settings.restoreTitle': 'Restaurar datos',
  'settings.restoreFrom': 'Backup del {date}:',
  'settings.restoreCollection': '{n} entradas de colección',
  'settings.restoreWishlist': '{n} cartas en wishlist',
  'settings.restoreTrades': '{n} listas de trade',
  'settings.restoreCustom': '{n} colecciones personalizadas',
  'settings.merge': 'Fusionar',
  'settings.replaceAll': 'Reemplazar todo',
  'settings.restored': 'Datos restaurados',
  'settings.invalidFile': 'Fichero inválido',
  'settings.corruptBackup': 'Backup corrupto',

  // Acerca de
  'about.backToApp': 'Volver a la app',
  'about.intro':
    'Una herramienta para gestionar tu colección del Gundam Card Game: qué cartas tienes, qué te falta, qué quieres conseguir y qué puedes intercambiar. Sin cuentas de usuario, sin servicios de pago y sin que tus datos salgan de tu dispositivo.',
  'about.noAccounts': 'Sin cuentas',
  'about.noAccountsBody':
    'No hay usuarios ni contraseñas. Nadie necesita ninguna credencial para usar la app.',
  'about.local': 'Todo en local',
  'about.localBody':
    'Colección, wishlist, listas de intercambio y colecciones personalizadas se guardan en tu navegador, con copias de seguridad automáticas.',
  'about.trades': 'Intercambios sin intermediarios',
  'about.tradesBody':
    'Comparte listas de hasta 50 cartas mediante un enlace o un código QR generado en tu propio dispositivo.',
  // Bienvenida
  'landing.eyebrow': 'Gratis · Sin cuentas',
  'landing.title': 'Tu colección de Gundam Card Game, controlada de verdad.',
  'landing.lead':
    'Catálogo completo, colección valorada, wishlist y listas de intercambio compartibles — todo en un solo sitio, sin registrarte y sin que tus datos salgan de tu dispositivo.',
  'landing.enter': 'Entrar',
  'landing.tileCatalog': 'Catálogo completo',
  'landing.tileCatalogBody': 'Todas las expansiones del Gundam Card Game, con búsqueda instantánea.',
  'landing.tilePrices': 'Precios por idioma',
  'landing.tilePricesBody':
    'Cada carta con su precio real de mercado desglosado por idioma (en/jp/zh-CN), y tu colección valorada al momento.',
  'landing.tileWishlist': 'Wishlist',
  'landing.tileWishlistBody': 'Crea listas de deseos y compártelas por enlace o QR con quien quieras.',
  'landing.tileTrade': 'Listas de intercambio',
  'landing.tileTradeBody': 'Marca lo que ofreces y comparte la lista — sin cuentas en ningún lado.',
  'landing.honestTitle': 'La parte honesta',
  'landing.honestBody':
    'Es un proyecto hecho por una persona, no una empresa. No hay nada que comprar dentro de la app, ni cuentas, ni inicio de sesión.',
  'landing.localBody': 'Tu colección, wishlist y listas de intercambio viven solo en este dispositivo.',

  // Apoyo (Buy Me a Coffee)
  'support.bmcAlt': 'Invítame a un café en Buy Me a Coffee',

  'about.noServer': 'Sin servidor propio',
  'about.noServerBody':
    'El catálogo y los precios se sincronizan periódicamente desde CardTrader y se publican como datos estáticos junto con el sitio.',
  'about.openSource': 'Código abierto',
  'about.openSourceBody':
    'Todo el código de este proyecto es público y las aportaciones son bienvenidas: informes de errores, ideas de funcionalidades o pull requests directos.',
  'about.viewRepo': 'Ver el repositorio',
  'about.philosophy': 'Parte de poordevelopers',
  'about.philosophyBody':
    ', un colectivo que construye herramientas simples, gratuitas y sin ánimo de lucro. Sin publicidad, sin trackear a nadie y sin vender datos: se hace software útil para la comunidad, no para el negocio.',
  'about.philosophyPrefix': 'Gundam Tracker es un proyecto de',
  'about.dataCredit': 'Datos de cartas y precios de',
  'about.notAffiliated': '. No afiliada a Bandai Namco ni a CardTrader.',

  // Tiempo relativo
  'time.minutes': 'hace {n} min',
  'time.hours': 'hace {n} h',
  'time.days': 'hace {n} d',
} as const

export type TranslationKey = keyof typeof es

const en: Record<TranslationKey, string> = {
  'nav.catalog': 'Catalog',
  'nav.collection': 'Collection',
  'nav.wishlist': 'Wishlist',
  'nav.trades': 'Trades',
  'nav.settings': 'Settings',
  'nav.scrollToTop': 'Scroll to top',
  'nav.scrollToBottom': 'Scroll to bottom',

  'common.cancel': 'Cancel',
  'common.create': 'Create',
  'common.delete': 'Delete',
  'common.back': 'Back',
  'common.select': 'Select',
  'common.selectAll': 'All',
  'common.selectNone': 'None',
  'common.add': 'Add',
  'common.remove': 'Remove',
  'common.retry': 'Retry',
  'common.close': 'Close',
  'common.onlyMissing': 'Missing only',
  'common.ownershipAll': 'All',
  'common.ownershipOwned': 'Owned',
  'common.ownershipMissing': 'Missing',
  'common.viewList': 'List view',
  'common.viewGrid': 'Grid view',
  'common.searchInList': 'Search this list…',
  'common.cards': 'cards',
  'common.card_one': '{n} card',
  'common.card_other': '{n} cards',
  'common.unique_other': '{n} unique',
  'common.copies_other': '{n} copies',
  'common.noData': 'no data',

  'welcome.text':
    'Welcome to Gundam Tracker. No accounts: your collection, wishlist and trade lists live only on this device.',
  'welcome.aboutLink': 'About this project (open source)',
  'welcome.dismiss': 'Dismiss',

  'catalog.title': 'CATALOG',
  'catalog.subtitle': '{n} Gundam Card Game cards',
  'catalog.subtitleEmpty': 'The whole Gundam Card Game, in your pocket',
  'catalog.searchPlaceholder': 'Search by name or number (ST01-001)…',
  'catalog.syncing': 'Syncing catalog… {done}/{total}',
  'catalog.downloadTitle': 'Download the catalog',
  'catalog.downloadBody':
    'Get every Gundam Card Game expansion onto this device to browse and search even offline.',
  'catalog.syncNow': 'Sync now',
  'catalog.pendingExpansions': '{n} expansions not downloaded',
  'catalog.download': 'Download',
  'catalog.newExpansions': '{n} new expansions available — use “Download” to get them.',
  'catalog.noResultsFor': 'No results for “{q}”.',
  'catalog.noResults': 'No results.',
  'catalog.truncated': 'Showing the first {max} of {total} results — refine your search to see the rest.',
  'catalog.selectN': 'Select all {n}',

  'expansion.notDownloaded':
    'This expansion has not been downloaded yet. Go back to the catalog and press “Download”.',

  'card.notFound': 'Card not found in the local catalog.',
  'card.minPrice': 'Lowest price (marketplace)',
  'card.offersAge': '{n} offers · {age}',
  'card.viewOnCardTrader': 'View on CardTrader',
  'card.priceByLanguage': 'By card language',
  'card.moreOffers': 'more offers on CardTrader',
  'card.inWishlist': 'In wishlist',
  'card.toWishlist': 'To wishlist',
  'card.toTradeList': 'To trade list',
  'card.newList': 'New list',
  'card.addToCollection': 'Add to collection',
  'card.added': 'Added',
  'card.inYourCollection': 'In your collection',
  'card.collections': 'Collections',
  'card.newCollection': 'New',
  'card.collectionNamePlaceholder': 'Name (e.g. Unit, Favourites…)',
  'card.addCopy': 'Add a copy',
  'card.wishlistRemoveConfirm': 'This card was on your wishlist. Remove it?',
  'card.addedToWishlist': 'Added to wishlist',
  'card.removedFromWishlist': 'Removed from wishlist',
  'card.addedToList': 'Added to the list',
  'card.listFull': 'The list is full (max. {max})',

  'collection.title': 'COLLECTION',
  'collection.unique': 'unique',
  'collection.copies': 'copies',
  'collection.valuedBasis': 'based on {n} of {m}',
  'collection.valuedFallback': '{n} priced in another language',
  'collection.refreshPrices': 'Refresh prices',
  'collection.refreshing': 'Refreshing…',
  'collection.pricesUpdated': 'Prices updated',
  'collection.pricesFailed': 'Could not refresh prices (offline?)',
  'collection.allCards': 'All cards',
  'collection.myCollections': 'My collections',
  'collection.byExpansion': 'By expansion',
  'collection.noCollectionCards': 'no cards',
  'collection.empty': 'You have no cards yet. Add them from the catalog.',
  'collection.emptyLink': 'catalog',
  'collection.allEmpty': 'You do not own any cards yet.',

  'customCollection.deleteConfirm': 'Delete the collection “{name}”?',
  'customCollection.deleteLabel': 'Delete collection',
  'customCollection.rename': 'Rename',
  'customCollection.empty': 'No cards yet. Add them from any card’s detail page.',
  'customCollection.none': 'No custom collections yet. Create them from any card’s detail page.',
  'customCollection.createAndAdd': 'Create and add',
  'customCollection.namePlaceholder': 'Name…',

  'bulk.selected': '{n} cards selected',
  'bulk.exit': 'Exit selection mode',
  'bulk.sectionOwned': 'Owned',
  'bulk.sectionWishlist': 'Wishlist',
  'bulk.sectionCollections': 'Collections',
  'bulk.sectionTrade': 'Trading',
  'bulk.addCopy': '+1 copy',
  'bulk.removeCopy': '−1 copy',
  'bulk.addToCollection': 'Add to collection',
  'bulk.removeFromThis': 'Remove from this',
  'bulk.addToWishlist': 'Add to wishlist',
  'bulk.addToTradeList': 'Add to trade list',
  'bulk.newCollection': 'New collection',
  'bulk.newList': 'New list',
  'bulk.confirmRemoveCopy': 'Remove one copy from {n} cards? Those you do not own are skipped.',
  'bulk.confirmRemoveWishlist': 'Remove {n} cards from the wishlist?',
  'bulk.confirmRemoveCollection': 'Remove {n} cards from this collection? Your owned copies are untouched.',
  'bulk.resultAddedCopies': '+1 copy on {n} cards',
  'bulk.resultRemovedCopies': '−1 copy on {n} cards',
  'bulk.resultNoneOwned': 'None of them had copies',
  'bulk.resultAddedWishlist': '{n} added to wishlist',
  'bulk.resultAllInWishlist': 'They were all on the wishlist already',
  'bulk.resultRemovedWishlist': '{n} removed from the wishlist',
  'bulk.resultNoneInWishlist': 'None of them were on the wishlist',
  'bulk.resultAddedCollection': '{n} cards added',
  'bulk.resultAllInCollection': 'They were all in that collection already',
  'bulk.resultRemovedCollection': '{n} cards removed from the collection',
  'bulk.resultAddedTrade': '{n} cards added to the list',
  'bulk.resultTradePartial': '{added} added · {skipped} do not fit (max. {max})',
  'bulk.resultWishlistPartial': '{added} added · {skipped} do not fit (max. {max})',

  'wishlist.title': 'WISHLIST',
  'wishlist.newList': 'New list',
  'wishlist.namePlaceholder': 'List name…',
  'wishlist.emptyLists':
    'Create lists of up to {max} wanted cards and share them with a link or QR — no accounts, no servers.',
  'wishlist.myLists': 'My lists',
  'wishlist.listEmpty': 'Empty list. Add cards from any card’s detail page.',
  'wishlist.collectionMatches': '{n} you already own',
  'wishlist.saveReceived': 'Save as received list',
  'wishlist.sortName': 'By name',
  'wishlist.sortExpansion': 'By expansion',
  'wishlist.sortPrice': 'By price',
  'wishlist.estimatedCost': 'Estimated cost',
  'wishlist.basis': 'based on {n} of {m} cards with a price',
  'wishlist.empty': 'Your wishlist is empty. Star cards from the catalog.',

  'trades.title': 'TRADES',
  'trades.newList': 'New list',
  'trades.namePlaceholder': 'List name…',
  'trades.empty':
    'Create lists of up to {max} cards to trade and share them with a link or QR — no accounts, no servers.',
  'trades.myLists': 'My lists',
  'trades.received': 'Received',
  'trades.from': 'from {alias}',
  'trades.copyLink': 'Copy link',
  'trades.qr': 'QR',
  'trades.exportFile': 'Export file',
  'trades.deleteConfirm': 'Delete this list?',
  'trades.linkCopied': 'Link copied',
  'trades.tooLong': 'The list is too large for a link. Use the QR code or “Export file”.',
  'trades.listEmpty': 'Empty list. Add cards from the detail page of any card you own.',
  'trades.unsyncedCard': 'card not synced',
  'trades.qrAlt': 'List QR code',
  'trades.sharedBy': 'List shared by {alias}',
  'trades.shared': 'Shared list',
  'trades.wishlistMatches': '{n} match your wishlist',
  'trades.unsyncedNotice':
    '{n} cards belong to expansions you have not synced yet: they show their id. Sync the catalog to see them in full.',
  'trades.saveReceived': 'Save as received list',
  'trades.goToCatalog': 'Go to the catalog',
  'trades.invalidLink': 'This link does not contain a valid list (was it truncated?).',

  'settings.title': 'SETTINGS',
  'settings.language': 'App language',
  'settings.languageHint': 'Affects the interface only; your cards’ language is set per copy.',
  'settings.catalog': 'Catalog',
  'settings.catalogHint':
    'The catalog and prices are published automatically from CardTrader; nobody needs to sign in to use them.',
  'settings.publishedData': 'Data published: {date} · {expansions} expansions · {cards} cards.',
  'settings.resync': 'Re-sync everything',
  'settings.syncing': 'Syncing {done}/{total}…',
  'settings.customCollections': 'Custom collections',
  'settings.customCollectionsHint':
    'Group cards however you like (types, favourites, arcs…) and use them as a filter in the catalog and your collection.',
  'settings.backups': 'Backups',
  'settings.backupsHint':
    'An automatic copy of your collection, wishlist, trade lists and custom collections is saved after every change (last 5 kept).',
  'settings.chooseFolder': 'Choose backup folder',
  'settings.folder': 'Folder: {name}',
  'settings.folderConfigured': 'Folder configured',
  'settings.noFolderSupport':
    'Your browser cannot save to a folder automatically: use the manual export.',
  'settings.restore': 'Restore',
  'settings.exportImport': 'Export / import',
  'settings.exportJson': 'Export JSON',
  'settings.importJson': 'Import JSON',
  'settings.install': 'Install the app',
  'settings.installHint':
    'Install it on this device to open it like an app, with its own icon and no browser bar.',
  'settings.installButton': 'Install app',
  'settings.installIosHint':
    "On iPhone/iPad, Apple doesn't allow installing from a button: tap Safari's Share icon and choose \"Add to Home Screen\".",
  'settings.support': 'Support the project',
  'settings.supportHint':
    "Gundam Tracker is free and will stay that way. If you find it useful, you can buy me a coffee — entirely optional.",
  'settings.project': 'Project',
  'settings.projectHint':
    'Gundam Tracker is open source: contributions and bug reports are welcome.',
  'settings.aboutLink': 'About the project and repository',
  'settings.restoreTitle': 'Restore data',
  'settings.restoreFrom': 'Backup from {date}:',
  'settings.restoreCollection': '{n} collection entries',
  'settings.restoreWishlist': '{n} cards on the wishlist',
  'settings.restoreTrades': '{n} trade lists',
  'settings.restoreCustom': '{n} custom collections',
  'settings.merge': 'Merge',
  'settings.replaceAll': 'Replace everything',
  'settings.restored': 'Data restored',
  'settings.invalidFile': 'Invalid file',
  'settings.corruptBackup': 'Corrupt backup',

  'about.backToApp': 'Back to the app',
  'about.intro':
    'A tool to manage your Gundam Card Game collection: what you own, what you are missing, what you want and what you can trade. No user accounts, no paid services and no data leaving your device.',
  'about.noAccounts': 'No accounts',
  'about.noAccountsBody': 'No users, no passwords. Nobody needs any credentials to use the app.',
  'about.local': 'Everything local',
  'about.localBody':
    'Collection, wishlist, trade lists and custom collections are stored in your browser, with automatic backups.',
  'about.trades': 'Trading without middlemen',
  'about.tradesBody':
    'Share lists of up to 50 cards with a link or a QR code generated on your own device.',
  'landing.eyebrow': 'Free · No accounts',
  'landing.title': 'Your Gundam Card Game collection, actually under control.',
  'landing.lead':
    'Full catalog, a valued collection, wishlist and shareable trade lists — all in one place, no sign-up, and none of your data ever leaves your device.',
  'landing.enter': 'Enter',
  'landing.tileCatalog': 'Full catalog',
  'landing.tileCatalogBody': 'Every Gundam Card Game expansion, with instant search.',
  'landing.tilePrices': 'Prices by language',
  'landing.tilePricesBody':
    'Every card with its real market price broken down by language (en/jp/zh-CN), and your collection valued on the spot.',
  'landing.tileWishlist': 'Wishlist',
  'landing.tileWishlistBody': 'Build wishlists and share them by link or QR with anyone.',
  'landing.tileTrade': 'Trade lists',
  'landing.tileTradeBody': "Mark what you're offering and share the list — no accounts on either side.",
  'landing.honestTitle': 'The honest part',
  'landing.honestBody':
    "This is a one-person project, not a company. There's nothing to buy inside the app, no accounts, no login.",
  'landing.localBody': 'Your collection, wishlist, and trade lists live only on this device.',

  'support.bmcAlt': 'Buy me a coffee on Buy Me a Coffee',

  'about.noServer': 'No server of our own',
  'about.noServerBody':
    'The catalog and prices are synced from CardTrader periodically and published as static data alongside the site.',
  'about.openSource': 'Open source',
  'about.openSourceBody':
    'All the code of this project is public and contributions are welcome: bug reports, feature ideas or direct pull requests.',
  'about.viewRepo': 'View the repository',
  'about.philosophy': 'Part of poordevelopers',
  'about.philosophyBody':
    ', a collective that builds simple, free, non-profit tools. No ads, no tracking and no data selling: software made useful for the community, not for business.',
  'about.philosophyPrefix': 'Gundam Tracker is a project by',
  'about.dataCredit': 'Card data and prices from',
  'about.notAffiliated': '. Not affiliated with Bandai Namco or CardTrader.',

  'time.minutes': '{n} min ago',
  'time.hours': '{n} h ago',
  'time.days': '{n} d ago',
}

const ca: Record<TranslationKey, string> = {
  'nav.catalog': 'Catàleg',
  'nav.collection': 'Col·lecció',
  'nav.wishlist': 'Wishlist',
  'nav.trades': 'Intercanvis',
  'nav.settings': 'Configuració',
  'nav.scrollToTop': 'Vés amunt',
  'nav.scrollToBottom': 'Vés avall',

  'common.cancel': 'Cancel·la',
  'common.create': 'Crea',
  'common.delete': 'Elimina',
  'common.back': 'Torna',
  'common.select': 'Selecciona',
  'common.selectAll': 'Totes',
  'common.selectNone': 'Cap',
  'common.add': 'Afegeix',
  'common.remove': 'Treu',
  'common.retry': 'Torna-ho a provar',
  'common.close': 'Tanca',
  'common.onlyMissing': 'Només les que falten',
  'common.ownershipAll': 'Totes',
  'common.ownershipOwned': 'En propietat',
  'common.ownershipMissing': 'Falten',
  'common.viewList': 'Veure en llista',
  'common.viewGrid': 'Veure en graella',
  'common.searchInList': 'Cerca en aquesta llista…',
  'common.cards': 'cartes',
  'common.card_one': '{n} carta',
  'common.card_other': '{n} cartes',
  'common.unique_other': '{n} úniques',
  'common.copies_other': '{n} còpies',
  'common.noData': 'sense dades',

  'welcome.text':
    'Benvingut a Gundam Tracker. Sense comptes: la teva col·lecció, wishlist i llistes d’intercanvi viuen només en aquest dispositiu.',
  'welcome.aboutLink': 'Sobre el projecte (codi obert)',
  'welcome.dismiss': 'Tanca l’avís',

  'catalog.title': 'CATÀLEG',
  'catalog.subtitle': '{n} cartes del Gundam Card Game',
  'catalog.subtitleEmpty': 'Tot el Gundam Card Game, a la butxaca',
  'catalog.searchPlaceholder': 'Cerca per nom o número (ST01-001)…',
  'catalog.syncing': 'Sincronitzant catàleg… {done}/{total}',
  'catalog.downloadTitle': 'Descarrega el catàleg',
  'catalog.downloadBody':
    'Baixa totes les expansions del Gundam Card Game en aquest dispositiu per navegar i cercar fins i tot sense connexió.',
  'catalog.syncNow': 'Sincronitza ara',
  'catalog.pendingExpansions': '{n} expansions sense descarregar',
  'catalog.download': 'Descarrega',
  'catalog.newExpansions': '{n} expansions noves disponibles — fes servir «Descarrega» per baixar-les.',
  'catalog.noResultsFor': 'Cap resultat per «{q}».',
  'catalog.noResults': 'Cap resultat.',
  'catalog.truncated':
    'Es mostren els primers {max} de {total} resultats — afina la cerca per veure la resta.',
  'catalog.selectN': 'Selecciona les {n}',

  'expansion.notDownloaded':
    'Aquesta expansió encara no s’ha descarregat. Torna al catàleg i prem «Descarrega».',

  'card.notFound': 'Carta no trobada al catàleg local.',
  'card.minPrice': 'Preu mínim (marketplace)',
  'card.offersAge': '{n} ofertes · {age}',
  'card.viewOnCardTrader': 'Mira-la a CardTrader',
  'card.priceByLanguage': 'Per idioma de la carta',
  'card.moreOffers': 'hi ha més ofertes a CardTrader',
  'card.inWishlist': 'A la wishlist',
  'card.toWishlist': 'A la wishlist',
  'card.toTradeList': 'A llista d’intercanvi',
  'card.newList': 'Llista nova',
  'card.addToCollection': 'Afegeix a la col·lecció',
  'card.added': 'Afegida',
  'card.inYourCollection': 'A la teva col·lecció',
  'card.collections': 'Col·leccions',
  'card.newCollection': 'Nova',
  'card.collectionNamePlaceholder': 'Nom (p. ex. Unit, Preferides…)',
  'card.addCopy': 'Afegeix una còpia',
  'card.wishlistRemoveConfirm': 'Aquesta carta era a la teva wishlist. La treiem?',
  'card.addedToWishlist': 'Afegida a la wishlist',
  'card.removedFromWishlist': 'Treta de la wishlist',
  'card.addedToList': 'Afegida a la llista',
  'card.listFull': 'La llista és plena (màx. {max})',

  'collection.title': 'COL·LECCIÓ',
  'collection.unique': 'úniques',
  'collection.copies': 'còpies',
  'collection.valuedBasis': 'basat en {n} de {m}',
  'collection.valuedFallback': '{n} amb preu d’un altre idioma',
  'collection.refreshPrices': 'Actualitza els preus',
  'collection.refreshing': 'Actualitzant…',
  'collection.pricesUpdated': 'Preus actualitzats',
  'collection.pricesFailed': 'No s’han pogut actualitzar els preus (sense connexió?)',
  'collection.allCards': 'Totes les cartes',
  'collection.myCollections': 'Les meves col·leccions',
  'collection.byExpansion': 'Per expansió',
  'collection.noCollectionCards': 'sense cartes',
  'collection.empty': 'Encara no tens cartes. Afegeix-les des del catàleg.',
  'collection.emptyLink': 'catàleg',
  'collection.allEmpty': 'Encara no tens cap carta en propietat.',

  'customCollection.deleteConfirm': 'Vols eliminar la col·lecció «{name}»?',
  'customCollection.deleteLabel': 'Elimina la col·lecció',
  'customCollection.rename': 'Reanomena',
  'customCollection.empty':
    'Encara no hi has afegit cartes. Fes-ho des del detall de qualsevol carta.',
  'customCollection.none':
    'Encara no tens col·leccions personalitzades. Crea-les des del detall de qualsevol carta.',
  'customCollection.createAndAdd': 'Crea i afegeix',
  'customCollection.namePlaceholder': 'Nom…',

  'bulk.selected': '{n} cartes seleccionades',
  'bulk.exit': 'Surt del mode selecció',
  'bulk.sectionOwned': 'Propietat',
  'bulk.sectionWishlist': 'Wishlist',
  'bulk.sectionCollections': 'Col·leccions',
  'bulk.sectionTrade': 'Intercanvi',
  'bulk.addCopy': '+1 còpia',
  'bulk.removeCopy': '−1 còpia',
  'bulk.addToCollection': 'Afegeix a col·lecció',
  'bulk.removeFromThis': 'Treu d’aquesta',
  'bulk.addToWishlist': 'Afegeix a wishlist',
  'bulk.addToTradeList': 'Afegeix a llista d’intercanvi',
  'bulk.newCollection': 'Col·lecció nova',
  'bulk.newList': 'Llista nova',
  'bulk.confirmRemoveCopy': 'Vols restar una còpia de {n} cartes? Les que no tinguis s’ometen.',
  'bulk.confirmRemoveWishlist': 'Vols treure {n} cartes de la wishlist?',
  'bulk.confirmRemoveCollection':
    'Vols treure {n} cartes d’aquesta col·lecció? No afecta la teva propietat.',
  'bulk.resultAddedCopies': '+1 còpia a {n} cartes',
  'bulk.resultRemovedCopies': '−1 còpia a {n} cartes',
  'bulk.resultNoneOwned': 'Cap no tenia còpies',
  'bulk.resultAddedWishlist': '{n} afegides a la wishlist',
  'bulk.resultAllInWishlist': 'Ja hi eren totes, a la wishlist',
  'bulk.resultRemovedWishlist': '{n} tretes de la wishlist',
  'bulk.resultNoneInWishlist': 'Cap no era a la wishlist',
  'bulk.resultAddedCollection': '{n} cartes afegides',
  'bulk.resultAllInCollection': 'Ja hi eren totes, en aquesta col·lecció',
  'bulk.resultRemovedCollection': '{n} cartes tretes de la col·lecció',
  'bulk.resultAddedTrade': '{n} cartes afegides a la llista',
  'bulk.resultTradePartial': '{added} afegides · {skipped} no hi caben (màx. {max})',
  'bulk.resultWishlistPartial': '{added} afegides · {skipped} no hi caben (màx. {max})',

  'wishlist.title': 'WISHLIST',
  'wishlist.newList': 'Llista nova',
  'wishlist.namePlaceholder': 'Nom de la llista…',
  'wishlist.emptyLists':
    'Crea llistes de fins a {max} cartes desitjades i comparteix-les amb un enllaç o QR — sense comptes ni servidors.',
  'wishlist.myLists': 'Les meves llistes',
  'wishlist.listEmpty': 'Llista buida. Afegeix cartes des del detall de qualsevol carta.',
  'wishlist.collectionMatches': '{n} ja les tens a la teva col·lecció',
  'wishlist.saveReceived': 'Desa com a llista rebuda',
  'wishlist.sortName': 'Per nom',
  'wishlist.sortExpansion': 'Per expansió',
  'wishlist.sortPrice': 'Per preu',
  'wishlist.estimatedCost': 'Cost estimat',
  'wishlist.basis': 'basat en {n} de {m} cartes amb preu',
  'wishlist.empty': 'La teva wishlist és buida. Marca cartes des del catàleg.',

  'trades.title': 'INTERCANVIS',
  'trades.newList': 'Llista nova',
  'trades.namePlaceholder': 'Nom de la llista…',
  'trades.empty':
    'Crea llistes de fins a {max} cartes per intercanviar i comparteix-les amb un enllaç o QR — sense comptes ni servidors.',
  'trades.myLists': 'Les meves llistes',
  'trades.received': 'Rebudes',
  'trades.from': 'de {alias}',
  'trades.copyLink': 'Copia l’enllaç',
  'trades.qr': 'QR',
  'trades.exportFile': 'Exporta el fitxer',
  'trades.deleteConfirm': 'Vols eliminar aquesta llista?',
  'trades.linkCopied': 'Enllaç copiat',
  'trades.tooLong':
    'La llista és massa gran per a un enllaç. Fes servir el QR o «Exporta el fitxer».',
  'trades.listEmpty': 'Llista buida. Afegeix cartes des del detall de qualsevol carta que tinguis.',
  'trades.unsyncedCard': 'carta no sincronitzada',
  'trades.qrAlt': 'QR de la llista',
  'trades.sharedBy': 'Llista compartida per {alias}',
  'trades.shared': 'Llista compartida',
  'trades.wishlistMatches': '{n} coincideixen amb la teva wishlist',
  'trades.unsyncedNotice':
    '{n} cartes pertanyen a expansions que encara no has sincronitzat: es mostren per id. Sincronitza el catàleg per veure-les senceres.',
  'trades.saveReceived': 'Desa com a llista rebuda',
  'trades.goToCatalog': 'Ves al catàleg',
  'trades.invalidLink': 'Aquest enllaç no conté cap llista vàlida (està tallat?).',

  'settings.title': 'CONFIGURACIÓ',
  'settings.language': 'Idioma de l’app',
  'settings.languageHint':
    'Només afecta la interfície; l’idioma de les teves cartes es tria a cada còpia.',
  'settings.catalog': 'Catàleg',
  'settings.catalogHint':
    'El catàleg i els preus es publiquen automàticament des de CardTrader; ningú no necessita iniciar sessió per fer-los servir.',
  'settings.publishedData': 'Dades publicades: {date} · {expansions} expansions · {cards} cartes.',
  'settings.resync': 'Torna a sincronitzar-ho tot',
  'settings.syncing': 'Sincronitzant {done}/{total}…',
  'settings.customCollections': 'Col·leccions personalitzades',
  'settings.customCollectionsHint':
    'Agrupa cartes com vulguis (tipus, preferides, arcs…) i fes-les servir com a filtre al catàleg i a la teva col·lecció.',
  'settings.backups': 'Còpies de seguretat',
  'settings.backupsHint':
    'Es desa una còpia automàtica de la col·lecció, wishlist, llistes d’intercanvi i col·leccions personalitzades després de cada canvi (històric de 5).',
  'settings.chooseFolder': 'Tria la carpeta de còpies',
  'settings.folder': 'Carpeta: {name}',
  'settings.folderConfigured': 'Carpeta configurada',
  'settings.noFolderSupport':
    'El teu navegador no permet desar en una carpeta automàticament: fes servir l’exportació manual.',
  'settings.restore': 'Restaura',
  'settings.exportImport': 'Exporta / importa',
  'settings.exportJson': 'Exporta JSON',
  'settings.importJson': 'Importa JSON',
  'settings.install': 'Instal·la l’app',
  'settings.installHint':
    'Instal·la-la en aquest dispositiu per obrir-la com una app, amb icona pròpia i sense la barra del navegador.',
  'settings.installButton': 'Instal·la l’app',
  'settings.installIosHint':
    'A iPhone/iPad, Apple no permet instal·lar des d’un botó: toca la icona de Compartir de Safari i tria «Afegeix a l’inici».',
  'settings.support': 'Dona suport al projecte',
  'settings.supportHint':
    'Gundam Tracker és gratuït i ho continuarà sent. Si et resulta útil, em pots convidar a un cafè — totalment opcional.',
  'settings.project': 'Projecte',
  'settings.projectHint':
    'Gundam Tracker és de codi obert: les aportacions i els informes d’error són benvinguts.',
  'settings.aboutLink': 'Sobre el projecte i el repositori',
  'settings.restoreTitle': 'Restaura les dades',
  'settings.restoreFrom': 'Còpia del {date}:',
  'settings.restoreCollection': '{n} entrades de col·lecció',
  'settings.restoreWishlist': '{n} cartes a la wishlist',
  'settings.restoreTrades': '{n} llistes d’intercanvi',
  'settings.restoreCustom': '{n} col·leccions personalitzades',
  'settings.merge': 'Fusiona',
  'settings.replaceAll': 'Reemplaça-ho tot',
  'settings.restored': 'Dades restaurades',
  'settings.invalidFile': 'Fitxer no vàlid',
  'settings.corruptBackup': 'Còpia malmesa',

  'about.backToApp': 'Torna a l’app',
  'about.intro':
    'Una eina per gestionar la teva col·lecció del Gundam Card Game: quines cartes tens, quines et falten, quines vols aconseguir i quines pots intercanviar. Sense comptes d’usuari, sense serveis de pagament i sense que les teves dades surtin del dispositiu.',
  'about.noAccounts': 'Sense comptes',
  'about.noAccountsBody':
    'No hi ha usuaris ni contrasenyes. Ningú no necessita cap credencial per fer servir l’app.',
  'about.local': 'Tot en local',
  'about.localBody':
    'Col·lecció, wishlist, llistes d’intercanvi i col·leccions personalitzades es desen al teu navegador, amb còpies de seguretat automàtiques.',
  'about.trades': 'Intercanvis sense intermediaris',
  'about.tradesBody':
    'Comparteix llistes de fins a 50 cartes amb un enllaç o un codi QR generat al teu propi dispositiu.',
  'landing.eyebrow': 'Gratuït · Sense comptes',
  'landing.title': 'La teva col·lecció del Gundam Card Game, controlada de veritat.',
  'landing.lead':
    'Catàleg complet, col·lecció valorada, wishlist i llistes d’intercanvi compartibles — tot en un sol lloc, sense registrar-te i sense que les teves dades surtin del dispositiu.',
  'landing.enter': 'Entra',
  'landing.tileCatalog': 'Catàleg complet',
  'landing.tileCatalogBody': 'Totes les expansions del Gundam Card Game, amb cerca instantània.',
  'landing.tilePrices': 'Preus per idioma',
  'landing.tilePricesBody':
    'Cada carta amb el seu preu real de mercat desglossat per idioma (en/jp/zh-CN), i la teva col·lecció valorada a l’instant.',
  'landing.tileWishlist': 'Wishlist',
  'landing.tileWishlistBody': 'Crea llistes de desitjos i comparteix-les per enllaç o QR amb qui vulguis.',
  'landing.tileTrade': 'Llistes d’intercanvi',
  'landing.tileTradeBody': 'Marca el que ofereixes i comparteix la llista — sense comptes enlloc.',
  'landing.honestTitle': 'La part honesta',
  'landing.honestBody':
    'És un projecte fet per una persona, no una empresa. No hi ha res a comprar dins l’app, ni comptes, ni inici de sessió.',
  'landing.localBody': 'La teva col·lecció, wishlist i llistes d’intercanvi viuen només en aquest dispositiu.',

  'support.bmcAlt': 'Convida’m a un cafè a Buy Me a Coffee',

  'about.noServer': 'Sense servidor propi',
  'about.noServerBody':
    'El catàleg i els preus se sincronitzen periòdicament des de CardTrader i es publiquen com a dades estàtiques juntament amb el lloc.',
  'about.openSource': 'Codi obert',
  'about.openSourceBody':
    'Tot el codi d’aquest projecte és públic i les aportacions són benvingudes: informes d’errors, idees de funcionalitats o pull requests directes.',
  'about.viewRepo': 'Mira el repositori',
  'about.philosophy': 'Part de poordevelopers',
  'about.philosophyBody':
    ', un col·lectiu que construeix eines simples, gratuïtes i sense ànim de lucre. Sense publicitat, sense rastrejar ningú i sense vendre dades: es fa programari útil per a la comunitat, no per al negoci.',
  'about.philosophyPrefix': 'Gundam Tracker és un projecte de',
  'about.dataCredit': 'Dades de cartes i preus de',
  'about.notAffiliated': '. No afiliada a Bandai Namco ni a CardTrader.',

  'time.minutes': 'fa {n} min',
  'time.hours': 'fa {n} h',
  'time.days': 'fa {n} d',
}

export const dictionaries: Record<UiLanguage, Record<TranslationKey, string>> = { en, es, ca }

export type TranslateParams = Record<string, string | number>

export function translate(
  lang: UiLanguage,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const template = dictionaries[lang][key]
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

/** Idioma inicial: preferencia del navegador si la soportamos, si no inglés. */
export function detectLanguage(): UiLanguage {
  const prefixes = (navigator.languages ?? [navigator.language ?? 'en']).map((l) =>
    l.toLowerCase().split('-')[0],
  )
  for (const p of prefixes) {
    if (p === 'es' || p === 'ca' || p === 'en') return p
  }
  return 'en'
}
