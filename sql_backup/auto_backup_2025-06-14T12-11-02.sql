--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Homebrew)

-- Started on 2025-06-14 15:11:02 MSK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS neondb;
--
-- TOC entry 3446 (class 1262 OID 16389)
-- Name: neondb; Type: DATABASE; Schema: -; Owner: neondb_owner
--

CREATE DATABASE neondb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = builtin LOCALE = 'C.UTF-8' BUILTIN_LOCALE = 'C.UTF-8';


ALTER DATABASE neondb OWNER TO neondb_owner;

\connect neondb

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 115838)
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- TOC entry 3448 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 882 (class 1247 OID 115968)
-- Name: BalconyType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BalconyType" AS ENUM (
    'BALCONY',
    'LOGGIA',
    'BOTH',
    'NONE'
);


ALTER TYPE public."BalconyType" OWNER TO neondb_owner;

--
-- TOC entry 885 (class 1247 OID 115978)
-- Name: BathroomType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BathroomType" AS ENUM (
    'COMBINED',
    'SEPARATE',
    'MULTIPLE'
);


ALTER TYPE public."BathroomType" OWNER TO neondb_owner;

--
-- TOC entry 879 (class 1247 OID 115959)
-- Name: BuildingType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BuildingType" AS ENUM (
    'BRICK',
    'PANEL',
    'MONOLITH',
    'OTHER',
    'MONOLITH_BRICK'
);


ALTER TYPE public."BuildingType" OWNER TO neondb_owner;

--
-- TOC entry 876 (class 1247 OID 115952)
-- Name: DealType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DealType" AS ENUM (
    'SALE',
    'RENT'
);


ALTER TYPE public."DealType" OWNER TO neondb_owner;

--
-- TOC entry 888 (class 1247 OID 115986)
-- Name: WindowsView; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."WindowsView" AS ENUM (
    'COURTYARD',
    'STREET',
    'BOTH'
);


ALTER TYPE public."WindowsView" OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 115856)
-- Name: Category; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text
);


ALTER TABLE public."Category" OWNER TO neondb_owner;

--
-- TOC entry 226 (class 1259 OID 116027)
-- Name: City; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."City" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."City" OWNER TO neondb_owner;

--
-- TOC entry 222 (class 1259 OID 115883)
-- Name: Comment; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Comment" OWNER TO neondb_owner;

--
-- TOC entry 225 (class 1259 OID 116012)
-- Name: District; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."District" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."District" OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 115875)
-- Name: Image; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Image" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    path text NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Image" OWNER TO neondb_owner;

--
-- TOC entry 220 (class 1259 OID 115863)
-- Name: Listing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    "userId" text NOT NULL,
    address text,
    "houseArea" double precision,
    "landArea" double precision,
    floor integer,
    "totalFloors" integer,
    condition text,
    "yearBuilt" integer,
    "noEncumbrances" boolean DEFAULT false,
    price double precision NOT NULL,
    currency text DEFAULT '₽'::text NOT NULL,
    "dateAdded" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "listingCode" text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    "adminComment" text,
    "publicDescription" text,
    "dealType" public."DealType" DEFAULT 'SALE'::public."DealType" NOT NULL,
    "balconyType" public."BalconyType",
    "bathroomType" public."BathroomType",
    "buildingType" public."BuildingType",
    "kitchenArea" double precision,
    "noShares" boolean DEFAULT false,
    "windowsView" public."WindowsView",
    "typeId" text,
    "districtId" text,
    title text NOT NULL,
    latitude double precision,
    longitude double precision,
    "fullAddress" text,
    "cityId" text
);


ALTER TABLE public."Listing" OWNER TO neondb_owner;

--
-- TOC entry 223 (class 1259 OID 115932)
-- Name: ListingHistory; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."ListingHistory" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "userId" text NOT NULL,
    changes jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action text DEFAULT 'update'::text NOT NULL
);


ALTER TABLE public."ListingHistory" OWNER TO neondb_owner;

--
-- TOC entry 224 (class 1259 OID 115994)
-- Name: PropertyType; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."PropertyType" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public."PropertyType" OWNER TO neondb_owner;

--
-- TOC entry 218 (class 1259 OID 115848)
-- Name: User; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    photo text
);


ALTER TABLE public."User" OWNER TO neondb_owner;

--
-- TOC entry 217 (class 1259 OID 115839)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO neondb_owner;

--
-- TOC entry 3433 (class 0 OID 115856)
-- Dependencies: 219
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Category" (id, name, slug, description) FROM stdin;
cma17xhoj0000n97c1me6gvu7	Квартиры	apartments	\N
cma17xip50001n97czf8u3mhm	Дома	houses	\N
cma17xja10002n97clar7xzll	Земельные участки	land	\N
cma17xo0z0003n97c87a2l7nj	Коммерция	commercial	\N
cmbjnytqh0004n9h0kiu2sg4z	Недвижимость за рубежом	international	\N
cmbjnyu450005n9h0yc2w2t4i	Новостройки	new-construction	\N
\.


--
-- TOC entry 3440 (class 0 OID 116027)
-- Dependencies: 226
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."City" (id, name, slug) FROM stdin;
78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	Краснодар	krasnodar
cmbtnkxrf0000jr040xylvgsh	ст. Елизаветинская	ст-елизаветинская
\.


--
-- TOC entry 3436 (class 0 OID 115883)
-- Dependencies: 222
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Comment" (id, "listingId", content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3439 (class 0 OID 116012)
-- Dependencies: 225
-- Data for Name: District; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."District" (id, name, slug) FROM stdin;
cmaianwry0000n9hb03zlv221	Прикубанский округ	prikubanskij-okrug
cmal7i3r30000n9jb49irduyh	Центральный	
\.


--
-- TOC entry 3435 (class 0 OID 115875)
-- Dependencies: 221
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Image" (id, "listingId", path, "isFeatured") FROM stdin;
cmbtn8afz0005la04twmp9aoh	cmbtn88dl0001la040vdj2wwv	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cbb912e2-9a8e-4496-a19c-92a0868abcb0.jpg	t
cmbtnymx20009lb040f6bj4lx	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg	t
cmbw6lhv30005ih047hu4rirr	cmbw6lfyb0001ih04jh7j8yo8	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/32d3bb8e-79c2-4662-b5bb-197e90e45c8d.jpg	t
cmbt6snrf0001l804e5btq6p8	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/1f3a4e6f-7aac-414c-a7a8-7d725a8d5afa.jpg	f
cmbtk2dpd0001n919jm9v81h3	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/e96986e7-7ea4-4438-9dc4-988baae54e88.jpg	f
cmbtka9vx0007n919q7bcikwc	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/9703dcc3-183f-48b4-9c17-4fc38754cb65.jpg	f
cmbtkha1e000dn9191k7stf2n	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/dc89636e-0d81-48c1-bc16-bfde11c20676.jpg	f
cmbtkjns3000jn919wji792g3	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/47a596ab-7417-4fa3-b11a-11d40a68778d.jpg	f
cmbtlbace0001n9igyhx6b4l8	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/65115e66-5ffe-418a-ac35-e3b2893a0509.jpg	f
cmbtlbal90003n9igxb40s2sb	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/641cc412-d2de-459d-af6f-5e389ef57958.jpg	f
cmbtlbapa0005n9igv2iwvywl	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/4e7fd17f-e5ef-46f2-af9b-4b98b701b6c2.jpg	f
cmbtlbata0007n9iguhmx5qpm	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/dadb8915-83e4-4d21-a57d-30dd10263420.jpg	f
cmbtj3qzs0001n9g776viw8az	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg	f
cmbtib9910003n980qgpoteos	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg	t
cmbtm2bxm000dn9ignfb76gxp	cmbt6qogb0001jv04651cnmyz	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/f0b34b18-367a-4ff3-8331-da74499c38d8.jpg	t
cmbv03ach0003n9ts5b5dze8z	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/7822c662-a0f5-4dc0-a92f-d9c55cf0b66a.jpg	f
cmbv03am50005n9ts38wf97cs	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/118e2fea-513d-4dfb-8a51-51ca51f97fe4.jpg	f
cmbv03ar40007n9tsoitvk8np	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/de99f342-a146-4887-a817-63be32448576.jpg	f
cmbv03avo0009n9tsfx3iczkw	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8c69ff13-995b-4cbb-a7cb-06dfb2c62aba.jpg	f
cmbv03b0e000bn9tsbv0rua2y	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/12326a9b-d2d2-410b-a913-197a84a70a86.jpg	f
cmbv03b4y000dn9tshm0spwhn	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ebcfe7cd-deb3-4822-afc5-4b59af32b776.jpg	f
cmbv03bai000fn9ts2uqv54sa	cmbtny34g0001lb04v5ccsltp	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg	f
\.


--
-- TOC entry 3434 (class 0 OID 115863)
-- Dependencies: 220
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Listing" (id, "categoryId", "userId", address, "houseArea", "landArea", floor, "totalFloors", condition, "yearBuilt", "noEncumbrances", price, currency, "dateAdded", "listingCode", status, "adminComment", "publicDescription", "dealType", "balconyType", "bathroomType", "buildingType", "kitchenArea", "noShares", "windowsView", "typeId", "districtId", title, latitude, longitude, "fullAddress", "cityId") FROM stdin;
cmbt6qogb0001jv04651cnmyz	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени 40-летия Победы, 101	54.3	\N	8	16	\N	\N	f	5300000	₽	2025-06-12 09:37:37.356	К-9378	active	Наш ЭКС	**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\r\n\r\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\r\n\r\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\r\n\r\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\r\n\r\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\r\n\r\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\r\n\r\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\r\n\r\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!	SALE	\N	\N	\N	11	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	\N	2-комнатная квартира 54.3 м²	45.058816	39.02967	Россия, Краснодар, улица имени 40-летия Победы, 101	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74
cmbtn88dl0001la040vdj2wwv	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Цезаря Куникова, 24к1	71	\N	7	16	Требуется ремонт	\N	t	6750000	₽	2025-06-12 17:19:10.186	К-5679	active	\N	🏢 Просторная квартира в престижном районе Метальникова\r\n\r\nПредставляем вашему вниманию великолепную квартиру, расположенную в одном из самых комфортных районов города! \r\n\r\n✨ Основные характеристики:\r\n• Общая площадь: 71 м²\r\n• Этаж: 7 из 16 (идеальный вариант без шума сверху и снизу)\r\n• Функциональная планировка Евро-формата\r\n• Светлая и просторная гостиная 20 м² с выходом на уютную лоджию (10 м²)\r\n\r\n🏠 Особый комфорт:\r\n• Продуманная планировка\r\n• Продуманное расположение окон\r\n• Возможность организовать зону отдыха с выходом на лоджию\r\n• Функциональная кухня-гостиная\r\n\r\n🏗 Развитая инфраструктура района:\r\n• В пешей доступности магазины, школы и детские сады\r\n• Удобная транспортная развязка\r\n• Благоустроенный двор\r\n• Парковочные места\r\n\r\nЭта квартира станет вашим идеальным гнездышком для комфортной жизни в одном из самых перспективных районов города! \r\n\r\nЗаписывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! \r\n\r\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!	SALE	LOGGIA	COMBINED	MONOLITH	10	t	COURTYARD	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 71 м²	45.099308	39.001409	Россия, Краснодар, улица Цезаря Куникова, 24к1	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74
cmbtny34g0001lb04v5ccsltp	cma17xip50001n97czf8u3mhm	cma17p91m0000n94r28v2tbcr	городской округ Краснодар, станица Елизаветинская	161	7	\N	\N	\N	\N	f	10000000	₽	2025-06-12 17:39:16.432	Д-8500	active	\N	Элитное предложение в СНТ «Родничок», ст. Елизаветинская — ваш идеальный загородный дом!\r\n\r\n---\r\n\r\n### 🏡 Основные характеристики:\r\n\r\n**Площадь**\r\n\r\n* Дом – **161 м²**, на участке **7 соток** земли.\r\n\r\n**Инженерные коммуникации**\r\n\r\n* Своя **скважина с питьевой водой**;\r\n* Подведены **газ** и система **септика**.\r\n\r\n**Состояние**\r\n\r\n* Выполнен качественный **ремонт**;\r\n* Предусмотрена готовая **мебель и техника** — можно въезжать сразу.\r\n\r\n**Локация**\r\n\r\n* СНТ «Родничок», станция Елизаветинская — экологически чистый, спокойный район, идеально подходит для комфортной жизни вдали от городского шума.\r\n\r\n**Цена**\r\n\r\n* **10 000 🍋** — эксклюзивное предложение по выгодной стоимости.\r\n\r\n---\r\n\r\n### Почему стоит присмотреться:\r\n\r\n* **Полноценный готовый дом** — нет нужды в дополнительных вложениях.\r\n* **Удобная инфраструктура**: рядом дорога, станции, магазины и зоны отдыха;\r\n* **Коммуникации подведены**, остаётся только заселиться.\r\n\r\n✨ Не упустите шанс — предложение ограничено! Готовы организовать показ в удобное время.\r\n\r\n📞 Свяжитесь с нами, чтобы узнать все подробности и договориться о просмотрах.\r\n	SALE	\N	\N	\N	\N	f	\N	a16b51bb-e859-42bd-bb86-98fd314fadd7	\N	Дом 161 м²	45.048431	38.799899	Россия, городской округ Краснодар, станица Елизаветинская	cmbtnkxrf0000jr040xylvgsh
cmbw6lfyb0001ih04jh7j8yo8	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Героев-Разведчиков, 48	\N	\N	\N	\N	Хорошее	\N	t	12800000	₽	2025-06-14 11:56:51.587	К-6008	active	\N	🏢 РОСКОШНАЯ ДВУХКОМНАТНАЯ КВАРТИРА В ПРЕСТИЖНОМ РАЙОНЕ\r\n\r\nПредставляем вашему вниманию великолепную двухкомнатную квартиру, расположенную в одном из самых комфортных для проживания районов города!\r\n\r\n✨ О КВАРТИРЕ:\r\n• Продуманная планировка\r\n• Светлая и просторная кухня с выходом на лоджию\r\n• Уютная прихожая большого размера\r\n• Две светлые и комфортные комнаты\r\n• Раздельный санузел с современной сантехникой\r\n• Выполнен качественный косметический ремонт\r\n\r\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\r\n• Закрытая территория с ограниченным доступом\r\n• Вход по электронному ключу или домофону\r\n• Благоустроенный двор с современными детскими площадками\r\n• Зелёная зона для спокойных прогулок\r\n• Оборудованная площадка для выгула домашних питомцев\r\n• Доброжелательные соседи\r\n\r\n📍 ПРЕИМУЩЕСТВА РАСПОЛОЖЕНИЯ:\r\n• Развитая инфраструктура: магазины, школы, детские сады, поликлиника – всё в шаговой доступности\r\n• В самом доме: продуктовые магазины, аптеки, пекарни, салоны красоты\r\n• Отличная транспортная доступность – остановки общественного транспорта рядом\r\n• Уединённое расположение вдали от проезжей части\r\n\r\nЭта квартира создана для комфортной жизни! Здесь каждый найдёт своё идеальное пространство: от просторной кухни до уютных спален.\r\n\r\nНе упустите возможность стать владельцем этой замечательной квартиры! Запишитесь на просмотр прямо сейчас и откройте для себя новый уровень комфортной жизни в одном из лучших районов города!\r\n\r\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!	SALE	LOGGIA	SEPARATE	PANEL	\N	t	COURTYARD	d4d608d6-f69a-4030-bd5b-1d73dc243be2	cmaianwry0000n9hb03zlv221	3-комнатная квартира	45.068792	39.033605	Россия, Краснодар, улица Героев-Разведчиков, 48	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74
\.


--
-- TOC entry 3437 (class 0 OID 115932)
-- Dependencies: 223
-- Data for Name: ListingHistory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ListingHistory" (id, "listingId", "userId", changes, "createdAt", action) FROM stdin;
cmbt6qom20003jv044jtoquod	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 8, "price": 5300000, "title": "2-комнатная квартира 54.3 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени 40-летия Победы, 101", "dealType": "SALE", "latitude": 45.058816, "noShares": false, "houseArea": 54.3, "longitude": 39.02967, "categoryId": "cma17xhoj0000n97c1me6gvu7", "fullAddress": "Россия, Краснодар, улица имени 40-летия Победы, 101", "kitchenArea": 11, "listingCode": "К-9378", "totalFloors": 16, "adminComment": "Наш ЭКС", "noEncumbrances": false, "publicDescription": "**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!\\r\\n\\r\\n[Здесь можно добавить информацию о площади квартиры, этаже, состоянии ремонта и другие важные детали, если они известны]"}, "action": "create"}	2025-06-12 09:37:37.562	create
cmbt6snz90003l804sk06x353	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/1f3a4e6f-7aac-414c-a7a8-7d725a8d5afa.jpg", "size": "2874KB", "filename": "20250504_121050.jpg"}]}	2025-06-12 09:39:10.053	images
cmbt6sp040005l804t87yh7lh	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 09:39:11.38	update
cmbt6svgi0007l804nv0ddgje	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"deleted": [{"id": "cmbt6qowv0005jv045j9ztl98", "path": "/images/apartments_placeholder.png", "isFeatured": true}]}	2025-06-12 09:39:19.746	images
cmbt6sw9l0009l804yplgui6e	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 09:39:20.793	update
cmbtl4l5n000vn919ftc107l3	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/859cde9f-1c06-4f8b-96f1-75ebfe6f1889.jpg", "size": "200KB", "filename": "20250504_121050.jpg"}]}	2025-06-12 16:20:20.891	images
cmbtl4mua000xn919433z8nb1	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:20:23.074	update
cmbti7zwi0001n980q5ft9z2w	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"publicDescription": {"new": "[](https://)**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!", "old": "**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!\\r\\n\\r\\n[Здесь можно добавить информацию о площади квартиры, этаже, состоянии ремонта и другие важные детали, если они известны]"}}}	2025-06-12 14:59:01.119	update
cmbtib9hd0005n980bsjfde6y	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}]}	2025-06-12 15:01:33.505	images
cmbtibc4e0007n980vlc6pfi7	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 15:01:36.926	update
cmbtj3rj10003n9g7j35q5ar6	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg", "size": "2780KB", "filename": "20250504_120049.jpg"}]}	2025-06-12 15:23:43.261	images
cmbtj3sls0005n9g7ffbmhdpl	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"publicDescription": {"new": "**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!", "old": "[](https://)**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!"}}}	2025-06-12 15:23:44.657	update
cmbtk2e1h0003n919qx81lfrr	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/e96986e7-7ea4-4438-9dc4-988baae54e88.jpg", "size": "3155KB", "filename": "20250504_120130.jpg"}]}	2025-06-12 15:50:38.741	images
cmbtk2fwg0005n919qk8w90gh	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 15:50:41.153	update
cmbtkaa7p0009n919dww00hrd	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/9703dcc3-183f-48b4-9c17-4fc38754cb65.jpg", "size": "2964KB", "filename": "20250504_120156.jpg"}]}	2025-06-12 15:56:47.029	images
cmbtkabzk000bn919lzjdd8b3	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 15:56:49.328	update
cmbtkhae1000fn919ovuuducy	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/dc89636e-0d81-48c1-bc16-bfde11c20676.jpg", "size": "238KB", "filename": "20250504_120454.jpg"}]}	2025-06-12 16:02:13.85	images
cmbtkhc3f000hn919u6ha6hcb	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:02:16.059	update
cmbtkjo42000ln919kwsbbult	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/47a596ab-7417-4fa3-b11a-11d40a68778d.jpg", "size": "241KB", "filename": "20250504_120248.jpg"}]}	2025-06-12 16:04:04.946	images
cmbtkjpx6000nn9199y45cklg	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:04:07.291	update
cmbtkkr44000pn9198e55lwcf	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg", "previous": "unknown", "previousPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/1f3a4e6f-7aac-414c-a7a8-7d725a8d5afa.jpg"}}	2025-06-12 16:04:55.492	images
cmbtkks3x000rn919dsk8mbxj	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:04:56.781	update
cmbtlbb340009n9igql2ltitk	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/65115e66-5ffe-418a-ac35-e3b2893a0509.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/641cc412-d2de-459d-af6f-5e389ef57958.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/4e7fd17f-e5ef-46f2-af9b-4b98b701b6c2.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/dadb8915-83e4-4d21-a57d-30dd10263420.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}]}	2025-06-12 16:25:34.432	images
cmbtlbcs6000bn9ig2iuh8x6h	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:25:36.63	update
cmbtlit4v0001jo04i23251xr	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg", "previous": "unknown", "previousPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg"}}	2025-06-12 16:31:24.415	images
cmbtliu2r0003jo0470tw8gok	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:31:25.635	update
cmbtljps60005jo04x1trmwo3	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg", "previous": "unknown", "previousPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg"}}	2025-06-12 16:32:06.726	images
cmbtljqpz0007jo04es1tm21z	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:32:07.944	update
cmbtm2cji000jn9igo5m0foqe	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/f0b34b18-367a-4ff3-8331-da74499c38d8.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/d1079c4e-75ae-4a26-94ea-f005cb2d5351.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/4a6981da-8931-4dbb-9010-036ddb8da978.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}]}	2025-06-12 16:46:36.03	images
cmbtm2e92000ln9igryfbn2r2	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:46:38.246	update
cmbtm364z000nn9igzpd1u1pt	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"deleted": [{"id": "cmbtl4ksz000tn919g3xh0mxw", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/859cde9f-1c06-4f8b-96f1-75ebfe6f1889.jpg", "isFeatured": false}, {"id": "cmbtm2c6f000fn9igrsonwi9h", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/d1079c4e-75ae-4a26-94ea-f005cb2d5351.jpg", "isFeatured": false}, {"id": "cmbtm2cai000hn9ig1te78liw", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/4a6981da-8931-4dbb-9010-036ddb8da978.jpg", "isFeatured": false}]}	2025-06-12 16:47:14.387	images
cmbtm3bks000pn9igpm1pf1dk	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:47:21.436	update
cmbtm6lo2000rn9igownb9a4n	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:49:54.482	update
cmbtny39s0003lb04pt5cuads	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"data": {"price": 10000000, "title": "Дача 161 м²", "cityId": "cmbtnkxrf0000jr040xylvgsh", "status": "active", "typeId": "9a2bc74e-2608-4e52-b948-da97c87c6446", "userId": "cma17p91m0000n94r28v2tbcr", "address": "городской округ Краснодар, станица Елизаветинская", "dealType": "SALE", "landArea": 7, "latitude": 45.048431, "noShares": false, "houseArea": 161, "longitude": 38.799899, "categoryId": "cma17xip50001n97czf8u3mhm", "fullAddress": "Россия, городской округ Краснодар, станица Елизаветинская", "listingCode": "Д-8500", "noEncumbrances": false, "publicDescription": "🏰 РОСКОШНЫЙ ДОМ В ПРЕСТИЖНОМ САДОВОМ ТОВАРИЩЕСТВЕ \\"РОДНИЧОК\\"\\r\\n\\r\\nПредставляем вашему вниманию великолепный дом, который станет вашим уютным гнездышком в живописном районе станицы Елизаветинская!\\r\\n\\r\\n✨ ГЛАВНЫЕ ПРЕИМУЩЕСТВА:\\r\\n• Просторный дом площадью 161 м²\\r\\n• Уютный участок 7 соток\\r\\n• Полностью готов к заселению!\\r\\n\\r\\n🏠 ГОТОВАЯ ИНФРАСТРУКТУРА:\\r\\n• Выполнен качественный ремонт\\r\\n• Вся необходимая мебель включена в стоимость\\r\\n• Современная бытовая техника\\r\\n• Все коммуникации заведены и готовы к использованию:\\r\\n  - Скважина для водоснабжения\\r\\n  - Надежный септик\\r\\n  - Газоснабжение (газовые коммуникации уже подведены)\\r\\n\\r\\n🏡 ОСОБЕННОСТИ УЧАСТКА:\\r\\n• Продуманная планировка территории\\r\\n• Возможность обустройства сада и зоны отдыха\\r\\n• Достаточно места для парковки и хозяйственных построек\\r\\n\\r\\n📍 ПРЕВОСХОДНАЯ ЛОКАЦИЯ:\\r\\n• Развитая инфраструктура станицы\\r\\n• В шаговой доступности магазины, школы и детские сады\\r\\n• Удобная транспортная доступность\\r\\n• Живописный берег реки Кубань в непосредственной близости\\r\\n\\r\\nЭтот дом – идеальное решение для тех, кто ценит комфорт и хочет жить в экологически чистом районе с прекрасной природой и всеми благами современной цивилизации!\\r\\n\\r\\nНе упустите возможность стать владельцем этого замечательного дома! Записывайтесь на просмотр прямо сейчас!\\r\\n\\r\\n📞 Свяжитесь с нами для получения подробной информации и организации просмотра!"}, "action": "create"}	2025-06-12 17:39:16.624	create
cmbtnylix0007lb0424z0dgw4	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"deleted": [{"id": "cmbtny3kz0005lb04x7y4gwwj", "path": "/images/houses_placeholder.png", "isFeatured": true}]}	2025-06-12 17:39:40.282	images
cmbtnyn28000blb04maenweqw	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg", "size": "193KB", "filename": "IMG-20250519-WA0219(1).jpg"}]}	2025-06-12 17:39:42.273	images
cmbtnynuq000dlb04s5prf3th	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 17:39:43.299	update
cmbtnyvgc000flb04apey28te	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 17:39:53.149	update
cmbtn88it0003la04wh494i62	cmbtn88dl0001la040vdj2wwv	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 7, "price": 6750000, "title": "2-комнатная квартира 71 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Цезаря Куникова, 24к1", "dealType": "SALE", "latitude": 45.099308, "noShares": true, "condition": "Требуется ремонт", "houseArea": 71, "longitude": 39.001409, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, улица Цезаря Куникова, 24к1", "kitchenArea": 10, "listingCode": "К-5679", "totalFloors": 16, "windowsView": "COURTYARD", "bathroomType": "COMBINED", "buildingType": "MONOLITH", "noEncumbrances": true, "publicDescription": "🏢 Просторная квартира в престижном районе Метальникова\\r\\n\\r\\nПредставляем вашему вниманию великолепную квартиру, расположенную в одном из самых комфортных районов города! \\r\\n\\r\\n✨ Основные характеристики:\\r\\n• Общая площадь: 71 м²\\r\\n• Этаж: 7 из 16 (идеальный вариант без шума сверху и снизу)\\r\\n• Функциональная планировка Евро-формата\\r\\n• Светлая и просторная гостиная 20 м² с выходом на уютную лоджию (10 м²)\\r\\n\\r\\n🏠 Особый комфорт:\\r\\n• Продуманная планировка\\r\\n• Продуманное расположение окон\\r\\n• Возможность организовать зону отдыха с выходом на лоджию\\r\\n• Функциональная кухня-гостиная\\r\\n\\r\\n🏗 Развитая инфраструктура района:\\r\\n• В пешей доступности магазины, школы и детские сады\\r\\n• Удобная транспортная развязка\\r\\n• Благоустроенный двор\\r\\n• Парковочные места\\r\\n\\r\\nЭта квартира станет вашим идеальным гнездышком для комфортной жизни в одном из самых перспективных районов города! \\r\\n\\r\\nЗаписывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! \\r\\n\\r\\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!"}, "action": "create"}	2025-06-12 17:19:10.373	create
cmbtn8anr0007la04j7tpohnk	cmbtn88dl0001la040vdj2wwv	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cbb912e2-9a8e-4496-a19c-92a0868abcb0.jpg", "size": "568KB", "filename": "20250517_115514.jpg"}]}	2025-06-12 17:19:13.143	images
cmbuhm0nq0001n9ts9o2vp3gn	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"title": {"new": "Дом 161 м²", "old": "Дача 161 м²"}, "typeId": {"new": "a16b51bb-e859-42bd-bb86-98fd314fadd7", "old": "9a2bc74e-2608-4e52-b948-da97c87c6446"}}}	2025-06-13 07:29:41.843	update
cmbv03bjm000hn9tsi8hss8jq	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/7822c662-a0f5-4dc0-a92f-d9c55cf0b66a.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/118e2fea-513d-4dfb-8a51-51ca51f97fe4.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/de99f342-a146-4887-a817-63be32448576.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8c69ff13-995b-4cbb-a7cb-06dfb2c62aba.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/12326a9b-d2d2-410b-a913-197a84a70a86.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ebcfe7cd-deb3-4822-afc5-4b59af32b776.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}]}	2025-06-13 16:07:02.195	images
cmbv03dow000jn9tsb3wv7bfn	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"publicDescription": {"new": "Элитное предложение в СНТ «Родничок», ст. Елизаветинская — ваш идеальный загородный дом!\\r\\n\\r\\n---\\r\\n\\r\\n### 🏡 Основные характеристики:\\r\\n\\r\\n**Площадь**\\r\\n\\r\\n* Дом – **161 м²**, на участке **7 соток** земли.\\r\\n\\r\\n**Инженерные коммуникации**\\r\\n\\r\\n* Своя **скважина с питьевой водой**;\\r\\n* Подведены **газ** и система **септика**.\\r\\n\\r\\n**Состояние**\\r\\n\\r\\n* Выполнен качественный **ремонт**;\\r\\n* Предусмотрена готовая **мебель и техника** — можно въезжать сразу.\\r\\n\\r\\n**Локация**\\r\\n\\r\\n* СНТ «Родничок», станция Елизаветинская — экологически чистый, спокойный район, идеально подходит для комфортной жизни вдали от городского шума.\\r\\n\\r\\n**Цена**\\r\\n\\r\\n* **10 000 🍋** — эксклюзивное предложение по выгодной стоимости.\\r\\n\\r\\n---\\r\\n\\r\\n### Почему стоит присмотреться:\\r\\n\\r\\n* **Полноценный готовый дом** — нет нужды в дополнительных вложениях.\\r\\n* **Удобная инфраструктура**: рядом дорога, станции, магазины и зоны отдыха;\\r\\n* **Коммуникации подведены**, остаётся только заселиться.\\r\\n\\r\\n✨ Не упустите шанс — предложение ограничено! Готовы организовать показ в удобное время.\\r\\n\\r\\n📞 Свяжитесь с нами, чтобы узнать все подробности и договориться о просмотрах.\\r\\n", "old": "🏰 РОСКОШНЫЙ ДОМ В ПРЕСТИЖНОМ САДОВОМ ТОВАРИЩЕСТВЕ \\"РОДНИЧОК\\"\\r\\n\\r\\nПредставляем вашему вниманию великолепный дом, который станет вашим уютным гнездышком в живописном районе станицы Елизаветинская!\\r\\n\\r\\n✨ ГЛАВНЫЕ ПРЕИМУЩЕСТВА:\\r\\n• Просторный дом площадью 161 м²\\r\\n• Уютный участок 7 соток\\r\\n• Полностью готов к заселению!\\r\\n\\r\\n🏠 ГОТОВАЯ ИНФРАСТРУКТУРА:\\r\\n• Выполнен качественный ремонт\\r\\n• Вся необходимая мебель включена в стоимость\\r\\n• Современная бытовая техника\\r\\n• Все коммуникации заведены и готовы к использованию:\\r\\n  - Скважина для водоснабжения\\r\\n  - Надежный септик\\r\\n  - Газоснабжение (газовые коммуникации уже подведены)\\r\\n\\r\\n🏡 ОСОБЕННОСТИ УЧАСТКА:\\r\\n• Продуманная планировка территории\\r\\n• Возможность обустройства сада и зоны отдыха\\r\\n• Достаточно места для парковки и хозяйственных построек\\r\\n\\r\\n📍 ПРЕВОСХОДНАЯ ЛОКАЦИЯ:\\r\\n• Развитая инфраструктура станицы\\r\\n• В шаговой доступности магазины, школы и детские сады\\r\\n• Удобная транспортная доступность\\r\\n• Живописный берег реки Кубань в непосредственной близости\\r\\n\\r\\nЭтот дом – идеальное решение для тех, кто ценит комфорт и хочет жить в экологически чистом районе с прекрасной природой и всеми благами современной цивилизации!\\r\\n\\r\\nНе упустите возможность стать владельцем этого замечательного дома! Записывайтесь на просмотр прямо сейчас!\\r\\n\\r\\n📞 Свяжитесь с нами для получения подробной информации и организации просмотра!"}}}	2025-06-13 16:07:04.977	update
cmbv03obk000ln9ts8hdt5cvf	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg", "previous": "unknown", "previousPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg"}}	2025-06-13 16:07:18.752	images
cmbv03pk3000nn9tskvnz7ia3	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-13 16:07:20.355	update
cmbv047s9000pn9tsu5mm3uqe	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg", "previous": "unknown", "previousPath": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg"}}	2025-06-13 16:07:43.978	images
cmbv049xm000rn9tswnw9spwo	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-13 16:07:46.762	update
cmbw6lg3m0003ih04rhrxvchj	cmbw6lfyb0001ih04jh7j8yo8	cmah4r0390000n98ec1sazzvm	{"data": {"price": 12800000, "title": "3-комнатная квартира", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "d4d608d6-f69a-4030-bd5b-1d73dc243be2", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Героев-Разведчиков, 48", "dealType": "SALE", "latitude": 45.068792, "noShares": true, "condition": "Хорошее", "longitude": 39.033605, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, улица Героев-Разведчиков, 48", "listingCode": "К-6008", "windowsView": "COURTYARD", "bathroomType": "SEPARATE", "buildingType": "PANEL", "noEncumbrances": true, "publicDescription": "🏢 РОСКОШНАЯ ДВУХКОМНАТНАЯ КВАРТИРА В ПРЕСТИЖНОМ РАЙОНЕ\\r\\n\\r\\nПредставляем вашему вниманию великолепную двухкомнатную квартиру, расположенную в одном из самых комфортных для проживания районов города!\\r\\n\\r\\n✨ О КВАРТИРЕ:\\r\\n• Продуманная планировка\\r\\n• Светлая и просторная кухня с выходом на лоджию\\r\\n• Уютная прихожая большого размера\\r\\n• Две светлые и комфортные комнаты\\r\\n• Раздельный санузел с современной сантехникой\\r\\n• Выполнен качественный косметический ремонт\\r\\n\\r\\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\\r\\n• Закрытая территория с ограниченным доступом\\r\\n• Вход по электронному ключу или домофону\\r\\n• Благоустроенный двор с современными детскими площадками\\r\\n• Зелёная зона для спокойных прогулок\\r\\n• Оборудованная площадка для выгула домашних питомцев\\r\\n• Доброжелательные соседи\\r\\n\\r\\n📍 ПРЕИМУЩЕСТВА РАСПОЛОЖЕНИЯ:\\r\\n• Развитая инфраструктура: магазины, школы, детские сады, поликлиника – всё в шаговой доступности\\r\\n• В самом доме: продуктовые магазины, аптеки, пекарни, салоны красоты\\r\\n• Отличная транспортная доступность – остановки общественного транспорта рядом\\r\\n• Уединённое расположение вдали от проезжей части\\r\\n\\r\\nЭта квартира создана для комфортной жизни! Здесь каждый найдёт своё идеальное пространство: от просторной кухни до уютных спален.\\r\\n\\r\\nНе упустите возможность стать владельцем этой замечательной квартиры! Запишитесь на просмотр прямо сейчас и откройте для себя новый уровень комфортной жизни в одном из лучших районов города!\\r\\n\\r\\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!"}, "action": "create"}	2025-06-14 11:56:51.778	create
cmbw6li2w0007ih043lr8g39z	cmbw6lfyb0001ih04jh7j8yo8	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/32d3bb8e-79c2-4662-b5bb-197e90e45c8d.jpg", "size": "209KB", "filename": "Изображение WhatsApp 2025-06-02 в 21.28.33_60cdb835.jpg"}]}	2025-06-14 11:56:54.344	images
\.


--
-- TOC entry 3438 (class 0 OID 115994)
-- Dependencies: 224
-- Data for Name: PropertyType; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PropertyType" (id, name, slug, "categoryId") FROM stdin;
6bec98df-22c4-4d2f-9c10-fc9a3fe3fe98	Студия	studio	cma17xhoj0000n97c1me6gvu7
559c2a97-40b4-4fcc-80be-618c18f07f55	1-комнатная квартира	1-room	cma17xhoj0000n97c1me6gvu7
a359a2cd-42c3-4f24-83e0-1432618b988e	2-комнатная квартира	2-room	cma17xhoj0000n97c1me6gvu7
d4d608d6-f69a-4030-bd5b-1d73dc243be2	3-комнатная квартира	3-room	cma17xhoj0000n97c1me6gvu7
3a40a5de-8b28-4090-a653-c66e37fbffcd	4-комнатная квартира	4-room	cma17xhoj0000n97c1me6gvu7
93cabc7d-d443-4de2-9382-aaf23e8f9def	5-комнатная квартира	5-room	cma17xhoj0000n97c1me6gvu7
1c955b48-aae6-4f75-b305-0f0461b91d4e	Пентхаус	penthouse	cma17xhoj0000n97c1me6gvu7
e24fb443-4ce4-4ba2-b64f-70aee9aadfd5	Таунхаус	townhouse	cma17xip50001n97czf8u3mhm
c79f858c-094e-4e35-a3e5-1236be2adede	Часть дома	house-part	cma17xip50001n97czf8u3mhm
4eb460b3-0cd1-4791-90b1-b72f9dc9b073	Дуплекс	duplex	cma17xip50001n97czf8u3mhm
9a2bc74e-2608-4e52-b948-da97c87c6446	Дача	cottage	cma17xip50001n97czf8u3mhm
8262d3c9-20c2-49ac-b6b5-4773435755cf	Торговая площадь	retail	cma17xo0z0003n97c87a2l7nj
d96d9e2f-9750-4a09-ad92-e4dff9e356e3	Коммерческая земля	commercial-land	cma17xo0z0003n97c87a2l7nj
ef9ff24a-852f-4f53-a555-e190886aa646	Офис	office	cma17xo0z0003n97c87a2l7nj
c71104e9-ee28-415a-b404-5bf2f455a1b8	Бизнес	business	cma17xo0z0003n97c87a2l7nj
8d8d859c-f875-4c77-9341-f9c99eec0b97	Склад	warehouse	cma17xo0z0003n97c87a2l7nj
308a142b-ff78-47ae-afbc-7eb023adf0f6	Участок	plot	cma17xja10002n97clar7xzll
0c80c2b7-7e00-4b39-81b1-e860bf2abf35	Под ИЖС	ihs	cma17xja10002n97clar7xzll
aa999b05-daa9-403e-a1e1-d461db4a15c7	Садоводство	gardening	cma17xja10002n97clar7xzll
a16b51bb-e859-42bd-bb86-98fd314fadd7	Дом	house	cma17xip50001n97czf8u3mhm
\.


--
-- TOC entry 3432 (class 0 OID 115848)
-- Dependencies: 218
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, username, password, phone, "createdAt", "updatedAt", photo) FROM stdin;
cma2nicl30000jo04dsn1zx6i	Ирина	irina	$2b$10$892viKMfU8oZcIAkHzL7Je.oB3obHAjpmyaP1kWqqTbgWAZ0bTh1K	+79624441579	2025-04-29 15:17:33.112	2025-04-29 15:17:33.112	
cmah4r0390000n98ec1sazzvm	Татьяна	dyvkovinka	$2b$10$B.GOSpwQQ164zaqoyiP74uAK4VW4a1mw3eVnNPIWD2NrewSJdoJum		2025-05-09 18:28:56.755	2025-05-09 18:28:56.755	
cma17p91m0000n94r28v2tbcr	Валерий Г.	valeriy	$2b$10$EnkjwGQ53gSWrKJ9EFA7Vue0NJSLlCrtRkgjsy55svWBqGenSLkV.	\N	2025-04-28 15:07:15.082	2025-06-05 17:42:10.132	\N
\.


--
-- TOC entry 3431 (class 0 OID 115839)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6b92b4f4-56d8-4f25-89b0-1fa215b02349	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-07 15:16:51.95183+00	20250607181619_make_property_type_optional		\N	2025-06-07 15:16:51.95183+00	0
bc0459db-71d7-42c1-8afc-dd0987a8c678	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-06-09 16:36:55.656276+00	20250414131013_init	\N	\N	2025-06-09 16:36:54.865644+00	1
2203f926-21a9-4a1a-b73b-a09eb241406e	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-05-02 17:38:43.300008+00	20250502173835_update_listing_fields	\N	\N	2025-05-02 17:38:42.380799+00	1
9e68d1bc-adb5-4396-8ebb-486a29b39c38	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-06-09 16:36:56.717516+00	20250414202255_rename_description	\N	\N	2025-06-09 16:36:55.955241+00	1
ed68603f-7ac0-49e0-9b8f-0e93e224702d	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-07 16:50:11.771279+00	20250610000000_add_city_model_and_field		\N	2025-06-07 16:50:11.771279+00	0
a14abf66-9760-4db5-8efd-88919cabb307	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-06-09 16:36:57.775956+00	20250420173452_add_user_photo	\N	\N	2025-06-09 16:36:57.022205+00	1
39a54acd-052e-4f26-965b-be862f1d3221	44be1fdc94dbe05522919c40dd9e8075b506fe9cf28806acaeb6e872368ea416	2025-05-10 13:46:11.379511+00	20250510134606_add_district_model	\N	\N	2025-05-10 13:46:10.919845+00	1
eb66f43a-f819-4bff-b620-a80c03547e64	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-06-09 16:36:58.83739+00	20250421193300_add_listing_edit_history	\N	\N	2025-06-09 16:36:58.077008+00	1
283f2755-41b2-486f-90ce-49989c6027fb	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-07 17:09:50.806849+00	20250620000000_make_city_optional		\N	2025-06-07 17:09:50.806849+00	0
f41cf16d-d96b-4339-96bb-1f6666847475	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-06-09 16:36:59.903853+00	20250421200226_add_listing_history	\N	\N	2025-06-09 16:36:59.14119+00	1
cdc13f63-b549-4cfb-aaea-ba133741b476	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	\N	20250510_manual_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510_manual_add_district_model\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "District" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"District\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1159), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225	2025-05-10 13:56:30.383282+00	2025-05-10 13:55:28.915369+00	0
8a03647c-049f-404f-8b2c-517b84b44c25	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-06-09 16:37:00.95622+00	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-06-09 16:37:00.205174+00	1
94b38ec3-2a62-42ac-94c7-7d57ded6a766	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-05-10 13:56:30.651235+00	20250510_manual_add_district_model		\N	2025-05-10 13:56:30.651235+00	0
59cab801-4af8-491b-a394-adfb257f4d9e	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-06-09 16:37:02.013675+00	20250502173835_update_listing_fields	\N	\N	2025-06-09 16:37:01.256865+00	1
a971b87f-6255-4997-b459-2212fb1f60cf	98777cb258344ebd3f939d592374734347e4aea7b5244a7d028b34761a064621	2025-06-09 16:37:03.087033+00	20250510_add_property_type_model	\N	\N	2025-06-09 16:37:02.313627+00	1
3136b34b-6b44-40fb-8e1b-f2dcaa112633	108bdb525b26edb330bac2c58b04ff0b265f2f202eae1998964ce7ce775bf529	2025-06-09 16:37:04.143091+00	20250510_fix_property_types	\N	\N	2025-06-09 16:37:03.385904+00	1
7f1e17ab-e644-4d6b-a090-36a18ea53818	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-06-09 16:37:05.210255+00	20250510_manual_add_district_model	\N	\N	2025-06-09 16:37:04.444851+00	1
3cc268eb-6466-4341-91ba-3168d3dfd0cc	d81500f21ed79be6dbac2d42f1682464f3d74d91711ca3af256707784f443cc3	\N	20250510134606_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510134606_add_district_model\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "districtId" of relation "Listing" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"districtId\\" of relation \\"Listing\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7478), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510134606_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510134606_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-09 16:37:41.626373+00	2025-06-09 16:37:05.510448+00	0
c86298d3-ea63-47d5-a9e0-83ea8d019529	d81500f21ed79be6dbac2d42f1682464f3d74d91711ca3af256707784f443cc3	2025-06-09 16:37:41.949987+00	20250510134606_add_district_model		\N	2025-06-09 16:37:41.949987+00	0
c041445d-a81a-4897-8ee6-7c2fd778e645	dda7fabbc5b70bb16b5a2350b7ea7f6c78f1e92834452d2162302edfc447e209	\N	undo_property_types	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: undo_property_types\n\nDatabase error code: 42501\n\nDatabase error:\nERROR: must be owner of table Listing\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42501), message: "must be owner of table Listing", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("aclchk.c"), line: Some(2981), routine: Some("aclcheck_error") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="undo_property_types"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="undo_property_types"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-10 14:07:38.537658+00	2025-05-16 22:22:34.277496+00	0
846ad8ae-08d6-4093-8065-45d20667aa83	9f109f53bfa5d3fcd1b3fa187664a696f0c2004bdbac037c6a7e24f6576b56c1	2025-06-09 16:38:45.075549+00	20250518212045_remove_rooms_field	\N	\N	2025-06-09 16:38:44.3215+00	1
9733a415-02e9-4913-9c74-09cf5b9c1aa1	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-06-09 16:38:46.131823+00	20250520000000_add_coordinates_to_listings	\N	\N	2025-06-09 16:38:45.377393+00	1
e99a3a94-d343-445a-bafa-ff4c84f729be	ead435c9d89b71dd29ef6939d3f775d794d47a4eaa76fda43700cba19aaaa1f6	2025-06-09 16:38:47.17906+00	20250520000000_make_district_optional	\N	\N	2025-06-09 16:38:46.429413+00	1
d686257d-fb04-4853-b1ca-57f5a133b5db	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-09 16:38:48.253868+00	20250607181619_make_property_type_optional	\N	\N	2025-06-09 16:38:47.49827+00	1
827a1ded-52a4-4d19-94cd-28792a756645	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-09 16:38:49.328152+00	20250610000000_add_city_model_and_field	\N	\N	2025-06-09 16:38:48.558731+00	1
961e283f-96ec-40ec-85e2-ce5a4497628d	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-09 16:38:50.386514+00	20250620000000_make_city_optional	\N	\N	2025-06-09 16:38:49.625416+00	1
5b3092de-db12-4d8f-8537-6f213c70597d	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-04-27 22:56:42.355668+00	20250414131013_init	\N	\N	2025-04-27 22:56:41.611757+00	1
489d6836-68bb-4750-b2d5-38c69ec87721	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-04-27 22:56:43.365843+00	20250414202255_rename_description	\N	\N	2025-04-27 22:56:42.644692+00	1
4838af72-cee9-4a8e-80d0-96833c932a10	ac165b61d6739ecbc3c2e11067894af95671f075718e1bca74fb02efd2fc51f4	2025-05-13 13:56:03.992701+00	20250510_add_property_type_model	\N	\N	2025-05-13 13:56:01.478285+00	1
1f260584-60cb-447a-8d45-a97d5ca6e3dd	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-04-27 22:56:44.400004+00	20250420173452_add_user_photo	\N	\N	2025-04-27 22:56:43.651371+00	1
47800b10-4356-402b-898c-6225b9ef1179	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-04-27 22:56:45.450622+00	20250421193300_add_listing_edit_history	\N	\N	2025-04-27 22:56:44.725302+00	1
e270b61d-42ee-45f9-89fc-020d9721ee82	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-04-27 22:56:46.458485+00	20250421200226_add_listing_history	\N	\N	2025-04-27 22:56:45.733836+00	1
7cfb3ebd-7dd0-42d7-b92e-3aba2ba31ad8	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-05-31 13:31:47.452815+00	20250520000000_add_coordinates_to_listings		\N	2025-05-31 13:31:47.452815+00	0
59459e44-be25-4af1-a33c-f4dadd545885	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-04-27 22:56:47.468463+00	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-04-27 22:56:46.745317+00	1
\.


--
-- TOC entry 3256 (class 2606 OID 115862)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 3274 (class 2606 OID 116033)
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- TOC entry 3264 (class 2606 OID 115890)
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- TOC entry 3271 (class 2606 OID 116018)
-- Name: District District_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 115882)
-- Name: Image Image_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_pkey" PRIMARY KEY (id);


--
-- TOC entry 3266 (class 2606 OID 115940)
-- Name: ListingHistory ListingHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 3260 (class 2606 OID 115874)
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- TOC entry 3268 (class 2606 OID 116000)
-- Name: PropertyType PropertyType_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PropertyType"
    ADD CONSTRAINT "PropertyType_pkey" PRIMARY KEY (id);


--
-- TOC entry 3253 (class 2606 OID 115855)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3251 (class 2606 OID 115847)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3257 (class 1259 OID 115892)
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- TOC entry 3275 (class 1259 OID 116034)
-- Name: City_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "City_slug_key" ON public."City" USING btree (slug);


--
-- TOC entry 3272 (class 1259 OID 116019)
-- Name: District_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "District_slug_key" ON public."District" USING btree (slug);


--
-- TOC entry 3258 (class 1259 OID 115893)
-- Name: Listing_listingCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Listing_listingCode_key" ON public."Listing" USING btree ("listingCode");


--
-- TOC entry 3269 (class 1259 OID 116001)
-- Name: PropertyType_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PropertyType_slug_key" ON public."PropertyType" USING btree (slug);


--
-- TOC entry 3254 (class 1259 OID 115891)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 3282 (class 2606 OID 115909)
-- Name: Comment Comment_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3281 (class 2606 OID 115904)
-- Name: Image Image_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3283 (class 2606 OID 115941)
-- Name: ListingHistory ListingHistory_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3284 (class 2606 OID 115946)
-- Name: ListingHistory ListingHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3276 (class 2606 OID 115894)
-- Name: Listing Listing_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3277 (class 2606 OID 139276)
-- Name: Listing Listing_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3278 (class 2606 OID 116020)
-- Name: Listing Listing_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3279 (class 2606 OID 139271)
-- Name: Listing Listing_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."PropertyType"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3280 (class 2606 OID 115899)
-- Name: Listing Listing_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3285 (class 2606 OID 116002)
-- Name: PropertyType PropertyType_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PropertyType"
    ADD CONSTRAINT "PropertyType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3447 (class 0 OID 0)
-- Dependencies: 3446
-- Name: DATABASE neondb; Type: ACL; Schema: -; Owner: neondb_owner
--

GRANT ALL ON DATABASE neondb TO neon_superuser;


--
-- TOC entry 3449 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- TOC entry 2095 (class 826 OID 139267)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2094 (class 826 OID 139264)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-06-14 15:11:19 MSK

--
-- PostgreSQL database dump complete
--

