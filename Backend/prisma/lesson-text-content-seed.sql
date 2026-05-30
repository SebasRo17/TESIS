INSERT INTO `content_variants` (
    `lesson_id`,
    `modality`,
    `difficulty_profile`,
    `reading_level`,
    `content_url`,
    `body_html`,
    `est_minutes`,
    `is_active`,
    `version`
)
SELECT
    l.id,
    'text',
    'beginner',
    'B1',
    NULL,
    '<h2>Operaciones con numeros reales</h2><p>Los numeros reales incluyen naturales, enteros, racionales e irracionales. En una expresion combinada conviene respetar el orden: parentesis, potencias, multiplicaciones o divisiones, y finalmente sumas o restas.</p><h3>Idea clave</h3><p>Cuando una expresion tiene varias operaciones, no se resuelve de izquierda a derecha sin criterio. Primero se identifica la estructura.</p><h3>Ejemplo guiado</h3><p>En 3 + 4 * 2, primero se calcula 4 * 2 = 8. Luego 3 + 8 = 11.</p><h3>Practica</h3><ol><li>Calcula 6 + 5 * 3.</li><li>Calcula (6 + 5) * 3.</li><li>Explica por que los resultados son distintos.</li></ol>',
    10,
    TRUE,
    2
FROM `lessons` l
WHERE l.`canonical_slug` = 'operaciones-numeros-reales'
  AND NOT EXISTS (
    SELECT 1 FROM `content_variants` cv
    WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2
  );

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'beginner', 'B1', NULL,
    '<h2>Fracciones equivalentes</h2><p>Dos fracciones son equivalentes cuando representan la misma cantidad. Para obtener una fraccion equivalente se multiplica o divide numerador y denominador por el mismo numero distinto de cero.</p><h3>Idea clave</h3><p>La fraccion 2/3 es equivalente a 4/6 porque ambos terminos fueron multiplicados por 2.</p><h3>Ejemplo guiado</h3><p>Para verificar si 3/5 y 6/10 son equivalentes, simplifica 6/10 dividiendo para 2: el resultado es 3/5.</p><h3>Practica</h3><ol><li>Escribe dos fracciones equivalentes a 1/4.</li><li>Simplifica 12/18.</li><li>Compara 2/3 y 8/12.</li></ol>',
    9, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'fracciones-equivalentes'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'intermediate', 'B1', NULL,
    '<h2>Resolver ecuaciones simples</h2><p>Una ecuacion lineal busca el valor de una incognita. La regla central es mantener el equilibrio: toda operacion aplicada a un lado debe aplicarse tambien al otro.</p><h3>Idea clave</h3><p>Para despejar x, deshacemos las operaciones en orden inverso.</p><h3>Ejemplo guiado</h3><p>Si x + 5 = 12, restamos 5 en ambos lados: x = 12 - 5, por tanto x = 7.</p><h3>Practica</h3><ol><li>Resuelve x - 4 = 9.</li><li>Resuelve 3x = 18.</li><li>Resuelve 2x + 1 = 11.</li></ol>',
    11, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'resolver-ecuaciones-simples'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'intermediate', 'B1', NULL,
    '<h2>Porcentajes en contexto</h2><p>Un porcentaje expresa una parte de cada 100. Sirve para describir descuentos, incrementos, intereses y comparaciones.</p><h3>Idea clave</h3><p>Para calcular p% de una cantidad, multiplica la cantidad por p/100.</p><h3>Ejemplo guiado</h3><p>El 20% de 80 es 80 * 20/100 = 16. Si era un descuento, el precio final es 80 - 16 = 64.</p><h3>Practica</h3><ol><li>Calcula el 15% de 200.</li><li>Un producto cuesta 50 y sube 10%. Halla el nuevo precio.</li><li>Explica la diferencia entre aumento y descuento.</li></ol>',
    10, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'porcentajes-en-contexto'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'beginner', 'B1', NULL,
    '<h2>Fundamentos de geometria</h2><p>La geometria estudia formas, posiciones y medidas. Sus elementos basicos son punto, recta, segmento, angulo y figura.</p><h3>Idea clave</h3><p>Una figura geometrica se entiende mejor al reconocer sus partes y sus propiedades: lados, vertices, angulos, paralelismo y perpendicularidad.</p><h3>Ejemplo guiado</h3><p>Un rectangulo tiene cuatro angulos rectos y lados opuestos paralelos e iguales.</p><h3>Practica</h3><ol><li>Dibuja un triangulo y marca sus vertices.</li><li>Escribe dos propiedades de un cuadrado.</li><li>Identifica un angulo recto en tu entorno.</li></ol>',
    8, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'fundamentos-geometria'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'intermediate', 'B1', NULL,
    '<h2>Teorema de Pitagoras</h2><p>En un triangulo rectangulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: a^2 + b^2 = c^2.</p><h3>Idea clave</h3><p>La hipotenusa siempre es el lado opuesto al angulo recto y suele ser el lado mas largo.</p><h3>Ejemplo guiado</h3><p>Si los catetos miden 3 y 4, entonces c^2 = 3^2 + 4^2 = 9 + 16 = 25, por tanto c = 5.</p><h3>Practica</h3><ol><li>Halla la hipotenusa si los catetos son 6 y 8.</li><li>Verifica si 5, 12 y 13 forman un triangulo rectangulo.</li><li>Explica por que no todos los triangulos usan Pitagoras.</li></ol>',
    12, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'teorema-pitagoras'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'intermediate', 'B2', NULL,
    '<h2>Razones trigonometricas</h2><p>En un triangulo rectangulo, seno, coseno y tangente relacionan lados con un angulo agudo.</p><h3>Idea clave</h3><p>Para un angulo dado: seno = cateto opuesto / hipotenusa, coseno = cateto adyacente / hipotenusa, tangente = cateto opuesto / cateto adyacente.</p><h3>Ejemplo guiado</h3><p>Si el cateto opuesto mide 3 y la hipotenusa 5, entonces sen(theta) = 3/5.</p><h3>Practica</h3><ol><li>Identifica el cateto opuesto en un dibujo.</li><li>Calcula cos(theta) si el adyacente mide 4 y la hipotenusa 5.</li><li>Compara seno y coseno para el mismo triangulo.</li></ol>',
    12, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'razones-trigonometricas'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'beginner', 'B1', NULL,
    '<h2>Patrones numericos</h2><p>Un patron numerico es una secuencia que sigue una regla. La regla puede sumar, restar, multiplicar, dividir o combinar operaciones.</p><h3>Idea clave</h3><p>Antes de adivinar el siguiente termino, compara diferencias o razones entre terminos consecutivos.</p><h3>Ejemplo guiado</h3><p>En 2, 5, 8, 11, la diferencia es siempre 3. El siguiente termino es 14.</p><h3>Practica</h3><ol><li>Completa 4, 8, 12, 16, __.</li><li>Completa 3, 6, 12, 24, __.</li><li>Explica la regla de cada serie.</li></ol>',
    8, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'patrones-numericos'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'advanced', 'B2', NULL,
    '<h2>Modelado de problemas</h2><p>Modelar un problema significa transformar un enunciado en una expresion, ecuacion o procedimiento matematico.</p><h3>Idea clave</h3><p>Primero identifica datos, pregunta y relaciones. Luego define una variable para lo desconocido.</p><h3>Ejemplo guiado</h3><p>Si Ana tiene el doble de libros que Luis y juntos tienen 18, sea x la cantidad de Luis. Ana tiene 2x y la ecuacion es x + 2x = 18.</p><h3>Practica</h3><ol><li>Subraya los datos de un problema verbal.</li><li>Define una variable para la cantidad desconocida.</li><li>Escribe una ecuacion antes de resolver.</li></ol>',
    13, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'modelado-problemas'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'beginner', 'B1', NULL,
    '<h2>Introduccion a funciones</h2><p>Una funcion relaciona cada entrada con exactamente una salida. Se puede representar con tabla, grafica, formula o descripcion verbal.</p><h3>Idea clave</h3><p>Si una entrada tiene dos salidas diferentes, la relacion no es funcion.</p><h3>Ejemplo guiado</h3><p>La regla f(x) = 2x + 1 es funcion porque cada valor de x produce un unico resultado.</p><h3>Practica</h3><ol><li>Calcula f(3) si f(x) = 2x + 1.</li><li>Construye una tabla para x = 0, 1, 2.</li><li>Explica que significa dominio.</li></ol>',
    10, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'introduccion-funciones'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'intermediate', 'B1', NULL,
    '<h2>Recta en el plano cartesiano</h2><p>Una recta puede describirse por su pendiente y su interseccion con el eje y. La forma y = mx + b resume ambas ideas.</p><h3>Idea clave</h3><p>La pendiente m indica cuanto cambia y cuando x aumenta una unidad.</p><h3>Ejemplo guiado</h3><p>En y = 2x + 3, la pendiente es 2 y la interseccion con el eje y es 3.</p><h3>Practica</h3><ol><li>Identifica m y b en y = -x + 4.</li><li>Calcula y cuando x = 2 en y = 3x - 1.</li><li>Describe si una pendiente negativa sube o baja.</li></ol>',
    11, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'recta-plano-cartesiano'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `content_variants` (`lesson_id`, `modality`, `difficulty_profile`, `reading_level`, `content_url`, `body_html`, `est_minutes`, `is_active`, `version`)
SELECT l.id, 'text', 'beginner', 'B1', NULL,
    '<h2>Probabilidad elemental</h2><p>La probabilidad mide que tan posible es que ocurra un evento. En casos simples, se calcula como casos favorables dividido para casos posibles.</p><h3>Idea clave</h3><p>Si todos los resultados son igualmente probables, basta contar de forma ordenada.</p><h3>Ejemplo guiado</h3><p>Al lanzar un dado, la probabilidad de obtener un numero par es 3/6 = 1/2, porque los pares son 2, 4 y 6.</p><h3>Practica</h3><ol><li>Calcula la probabilidad de sacar cara en una moneda.</li><li>Calcula la probabilidad de obtener 5 en un dado.</li><li>Explica que son casos favorables.</li></ol>',
    9, TRUE, 2
FROM `lessons` l
WHERE l.`canonical_slug` = 'probabilidad-elemental'
  AND NOT EXISTS (SELECT 1 FROM `content_variants` cv WHERE cv.`lesson_id` = l.id AND cv.`modality` = 'text' AND cv.`version` = 2);

INSERT INTO `lesson_resources` (`lesson_id`, `type`, `url`, `title`, `description`)
SELECT
    l.id,
    'text',
    NULL,
    CONCAT('Lectura: ', l.`title`),
    'Material de prueba en texto generado para validar el consumo de contenido por leccion.'
FROM `lessons` l
WHERE l.`is_active` = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM `lesson_resources` lr
    WHERE lr.`lesson_id` = l.id AND lr.`type` = 'text'
  );
