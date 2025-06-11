--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5 (Homebrew)

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
-- Name: BathroomType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BathroomType" AS ENUM (
    'COMBINED',
    'SEPARATE',
    'MULTIPLE'
);


ALTER TYPE public."BathroomType" OWNER TO neondb_owner;

--
-- Name: BuildingType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."BuildingType" AS ENUM (
    'BRICK',
    'PANEL',
    'MONOLITH',
    'OTHER'
);


ALTER TYPE public."BuildingType" OWNER TO neondb_owner;

--
-- Name: DealType; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public."DealType" AS ENUM (
    'SALE',
    'RENT'
);


ALTER TYPE public."DealType" OWNER TO neondb_owner;

--
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
-- Name: City; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."City" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."City" OWNER TO neondb_owner;

--
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
-- Name: District; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."District" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."District" OWNER TO neondb_owner;

--
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
-- Name: Listing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."Listing" (
    id text NOT NULL,
    title text NOT NULL,
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
    "districtId" text,
    "typeId" text,
    "fullAddress" text,
    latitude double precision,
    longitude double precision,
    "cityId" text
);


ALTER TABLE public."Listing" OWNER TO neondb_owner;

--
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
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."City" (id, name, slug) FROM stdin;
a7e29ffb-6960-4c3c-9ed6-c0010c139850	Краснодар	krasnodar
cmbmhu7340002n9nnnqxq9faq	Сочи	сочи
\.


--
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Comment" (id, "listingId", content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: District; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."District" (id, name, slug) FROM stdin;
cmaianwry0000n9hb03zlv221	Прикубанский округ	prikubanskij-okrug
cmal7i3r30000n9jb49irduyh	Центральный	
\.


--
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Image" (id, "listingId", path, "isFeatured") FROM stdin;
cmbhxq8f10001n9vn50xg8zrv	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6747ef0f-aef3-4970-b36e-b33a5b5c294d.jpg	t
cmbhy2zpj0007n9vnsv0va7qu	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/1acf8971-d55d-4dc2-b555-d211a5e3dd01.jpg	t
cmbhy2zug0009n9vnd43j6r66	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/843ec1a4-8b8a-4156-870d-cf4e99861d81.jpg	f
cmbhy301k000fn9vnit4zijdx	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/a7785b1d-13d6-43e2-a882-2a3273c02984.jpg	f
cmbhy304a000hn9vnr4cdpk3o	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/749c7aa6-1f51-44ab-8d2b-b6c7e5eacf9e.jpg	f
cmbhy306h000jn9vnv7qy1c7n	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/21c5e28c-2ae1-49a0-8385-58609e4ea9a2.jpg	f
cmbhy308z000ln9vntxhevdgz	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/dadf48b7-915f-4516-904a-82b220421405.jpg	f
cmbhy30b6000nn9vne3g0mmut	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/75486927-17a6-4984-8cd4-41b476bac9d2.jpg	f
cmbhy30dj000pn9vn5prs3zch	cmbgnbzur0003n9svtri8yo3g	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/76346e64-f4c7-4c7c-b1fc-810298ded7ac.jpg	f
cmawe1z3j0001jv04rglvi1om	cmawdytyr0001jv04sw80ogdt	https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/34211a3d-f7cc-4d22-8dab-145e1379389b.jpeg	t
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Listing" (id, title, "categoryId", "userId", address, "houseArea", "landArea", floor, "totalFloors", condition, "yearBuilt", "noEncumbrances", price, currency, "dateAdded", "listingCode", status, "adminComment", "publicDescription", "dealType", "balconyType", "bathroomType", "buildingType", "kitchenArea", "noShares", "windowsView", "districtId", "typeId", "fullAddress", latitude, longitude, "cityId") FROM stdin;
cmawdytyr0001jv04sw80ogdt	2-комнатная квартира 67 м²	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Домбайская улица	67	\N	11	24	Ремонт под ключ	\N	f	7500000	₽	2025-05-20 10:43:31.251	К-5420	active	Р. Юлий\r\n\r\n+7-914-418-88-84\r\n\r\nНаши 100	Прикубанский округ города Краснодара, ЖК Губернский. Новый дом, хорошая инфраструктура. Вид на аллею. Лоджия совмещена с кухней. Санузел в плитке.\r\n\r\nОстается кухонный гарнитур без техники.	SALE	LOGGIA	SEPARATE	\N	11	f	STREET	cmaianwry0000n9hb03zlv221	a359a2cd-42c3-4f24-83e0-1432618b988e	Россия, Краснодар, Домбайская улица	45.072179	39.030874	a7e29ffb-6960-4c3c-9ed6-c0010c139850
cmbgnbzur0003n9svtri8yo3g	2-комнатная квартира 55 м²	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени 40-летия Победы	55	\N	8	16	Ремонт под ключ	\N	f	5300000	₽	2025-06-03 15:01:05.475	К-1764	active	📞8(903)4103070\r\n☎️89298510395	✅️Ремонт от застройщика\r\n✅️Без обременений	SALE	\N	\N	BRICK	\N	f	\N	cmaianwry0000n9hb03zlv221	a359a2cd-42c3-4f24-83e0-1432618b988e	Россия, Краснодар, улица имени 40-летия Победы	45.055779	39.015144	a7e29ffb-6960-4c3c-9ed6-c0010c139850
\.


--
-- Data for Name: ListingHistory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ListingHistory" (id, "listingId", "userId", changes, "createdAt", action) FROM stdin;
cmawdyu490003jv04e9av0qoq	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"data": {"floor": 11, "price": 7500000, "title": "2-комнатная квартира 67 м²", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "ул. Домбайская", "dealType": "SALE", "noShares": false, "condition": "Ремонт под ключ", "houseArea": 67, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "kitchenArea": 11, "listingCode": "К-5420", "totalFloors": 24, "windowsView": "STREET", "adminComment": "Р. Юлий\\r\\n\\r\\n+7-914-418-88-84\\r\\n\\r\\nНаши 100", "bathroomType": "SEPARATE", "noEncumbrances": false, "publicDescription": "Прикубанский округ города Краснодара, ЖК Губернский. Новый дом, хорошая инфраструктура. Вид на аллею. Лоджия совмещена с кухней. Санузел в плитке.\\r\\n\\r\\nОстается кухонный гарнитур без техники."}, "action": "create"}	2025-05-20 10:43:31.449	create
cmawe1zbo0003jv04pju7wvii	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/34211a3d-f7cc-4d22-8dab-145e1379389b.jpeg", "size": "283KB", "filename": "WhatsApp Image 2025-05-20 at 13.45.13.jpeg"}]}	2025-05-20 10:45:58.165	images
cmawe20fd0005jv047ti3nz9k	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-05-20 10:45:59.593	update
cmawe24xk0007jv046cm1qksf	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"deleted": [{"id": "cmawdyuey0005jv04pny2rieo", "path": "/images/apartments_placeholder.png", "isFeatured": true}]}	2025-05-20 10:46:05.432	images
cmawe25uf0009jv04zhhov0d8	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-05-20 10:46:06.616	update
cmawe2brk000bjv0414w1z3cc	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-05-20 10:46:14.289	update
cmbhy64tv0001n9iznx693zaz	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"deleted": [{"id": "cmbhy2zwn000bn9vnddhvf71n", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cb18b283-009c-44e9-94d4-cb2680f50835.jpg", "isFeatured": false}, {"id": "cmbhy2zz9000dn9vnzb2j56jb", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/30547755-9b7e-4c5f-b28c-6a6302f3d860.jpg", "isFeatured": false}]}	2025-06-04 12:52:13.939	images
cmbhy6a8b0003n9izooh4rc8j	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-04 12:52:20.939	update
cmbdukirh0001n9s0w0uf4wgf	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Домбайская улица", "old": "ул. Домбайская"}, "latitude": {"new": 45.072179, "old": null}, "longitude": {"new": 39.030874, "old": null}, "fullAddress": {"new": "Россия, Краснодар, Домбайская улица", "old": null}}}	2025-06-01 16:00:22.01	update
cmbgnc0100005n9svbg9s73wh	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"data": {"floor": 8, "price": 5300000, "title": "2-комнатная квартира 55 м²", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени 40-летия Победы", "dealType": "SALE", "latitude": 45.055779, "noShares": false, "condition": "Ремонт под ключ", "houseArea": 55, "longitude": 39.015144, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, улица имени 40-летия Победы", "listingCode": "К-1764", "totalFloors": 16, "adminComment": "📞8(903)4103070\\r\\n☎️89298510395", "buildingType": "BRICK", "noEncumbrances": false, "publicDescription": "✅️Ремонт от застройщика\\r\\n✅️Без обременений"}, "action": "create"}	2025-06-03 15:01:05.701	create
cmbgo0at3000zn9svljveibng	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/e690a16b-84c8-4e5a-ba0c-19d489aaa5fa.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/efdab475-9a04-4ae0-9820-0468be1bd8d2.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cc6e509e-bce6-4531-bcf9-b3b5378aa866.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cd4eb4f8-6f4c-441c-8b6e-54e5b8949440.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/eb978494-72b8-4a52-96a6-0f82de9d6b44.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/85aac796-4ca8-4325-9fc2-ed443d173064.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/43e23e10-abf5-487b-b557-b725570a5bae.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cc2a55a8-6f27-4368-97a2-6a866391b1d0.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/4fff851f-ca7c-4b44-9003-a2b51b1e7d3c.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/50fb33fc-792e-41eb-9a41-c6fcc3b5e808.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/55468bcb-563b-4ef2-a86f-460a6a0a0140.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8119221d-989c-492a-bd83-d3334546ac3d.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/0cbc2d58-4032-4432-8b99-cd2f40b31e43.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/693d7033-cac5-4045-8a69-8c2fe6776f87.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}]}	2025-06-03 15:19:59.416	images
cmbgo4glp001tn9svwgj8k8r3	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/c9c4d0b2-8699-4c99-9a2e-06b9dc7b85f9.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6011897d-bb69-4399-bdbc-33fc7d489643.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/5958d0e6-14f8-4290-8a20-df5d6d830687.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/bb3178cf-fba7-43b9-9a7f-de6ca45308b5.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6906ea9d-eaf9-4a0c-8bb0-c0c135f9ddf7.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6af96485-a74d-4a01-a952-f9dd41a312ba.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/0e0489ae-8d8e-4aba-9b67-97e618906372.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/d219e187-2abf-4fe5-bbbc-09199f61bf6a.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/91454869-c1e9-4e95-9b4e-5018e3158815.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/9efb9622-83d4-45f9-83cd-7a00c5913edb.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/a9c91bc0-ae74-4daa-b4a1-d06768d0e6e9.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ffdcb87a-3fe5-4d58-8b5c-a2b60ab24529.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/2bdbb929-f6f0-4b0b-a398-6df10a921eef.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ed0e93ac-e016-43a3-9dfc-9d4cfebf3b7b.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}]}	2025-06-03 15:23:13.549	images
cmbgo4ict001vn9svncmp70c4	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-03 15:23:15.822	update
cmbgo4uxg0023n9svzrjl3p9p	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ae76d533-fab4-45e4-b6be-dc9ff9ab1b7f.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/16451347-0635-4120-83fe-b954bf1c6616.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/28611052-459c-421a-8322-beed4ed50ea2.jpg", "size": "3060KB", "filename": "20250504_121201.jpg"}]}	2025-06-03 15:23:32.117	images
cmbgo4vvo0025n9svhmqk2eh0	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-03 15:23:33.348	update
cmbgod49e0001jm04t1cgny5f	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"deleted": [{"id": "cmbgo09cb0007n9svjovl6gxk", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/e690a16b-84c8-4e5a-ba0c-19d489aaa5fa.jpg", "isFeatured": true}, {"id": "cmbgo09q60009n9svz3uppinb", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/efdab475-9a04-4ae0-9820-0468be1bd8d2.jpg", "isFeatured": false}, {"id": "cmbgo09sy000bn9svw6r6oavd", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cc6e509e-bce6-4531-bcf9-b3b5378aa866.jpg", "isFeatured": false}, {"id": "cmbgo09vq000dn9svq5cczexf", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cd4eb4f8-6f4c-441c-8b6e-54e5b8949440.jpg", "isFeatured": false}, {"id": "cmbgo09yi000fn9svc00cnvuk", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/eb978494-72b8-4a52-96a6-0f82de9d6b44.jpg", "isFeatured": false}, {"id": "cmbgo0a1b000hn9sv5u0ldrd0", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/85aac796-4ca8-4325-9fc2-ed443d173064.jpg", "isFeatured": false}, {"id": "cmbgo0a42000jn9svswub0nby", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/43e23e10-abf5-487b-b557-b725570a5bae.jpg", "isFeatured": false}, {"id": "cmbgo0a6u000ln9svm1vtsqcl", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cc2a55a8-6f27-4368-97a2-6a866391b1d0.jpg", "isFeatured": false}, {"id": "cmbgo0a9m000nn9svceuzwhnt", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/4fff851f-ca7c-4b44-9003-a2b51b1e7d3c.jpg", "isFeatured": false}, {"id": "cmbgo0acd000pn9sv69sshf5a", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/50fb33fc-792e-41eb-9a41-c6fcc3b5e808.jpg", "isFeatured": false}, {"id": "cmbgo0af6000rn9svxdxf04bu", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/55468bcb-563b-4ef2-a86f-460a6a0a0140.jpg", "isFeatured": false}, {"id": "cmbgo0ahz000tn9svos3wt92u", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/8119221d-989c-492a-bd83-d3334546ac3d.jpg", "isFeatured": false}, {"id": "cmbgo0akq000vn9svoi2cs1jy", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/0cbc2d58-4032-4432-8b99-cd2f40b31e43.jpg", "isFeatured": false}, {"id": "cmbgo0ani000xn9svvyyipjrl", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/693d7033-cac5-4045-8a69-8c2fe6776f87.jpg", "isFeatured": false}, {"id": "cmbgo4evr0011n9svw146x9oy", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/c9c4d0b2-8699-4c99-9a2e-06b9dc7b85f9.jpg", "isFeatured": true}, {"id": "cmbgo4f1b0013n9svk5lktkj9", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6011897d-bb69-4399-bdbc-33fc7d489643.jpg", "isFeatured": false}, {"id": "cmbgo4f3y0015n9svdnuzy4q9", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/5958d0e6-14f8-4290-8a20-df5d6d830687.jpg", "isFeatured": false}, {"id": "cmbgo4f6j0017n9svlv5bkqus", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/bb3178cf-fba7-43b9-9a7f-de6ca45308b5.jpg", "isFeatured": false}, {"id": "cmbgo4f9y0019n9svu5fdisp7", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6906ea9d-eaf9-4a0c-8bb0-c0c135f9ddf7.jpg", "isFeatured": false}, {"id": "cmbgo4fd2001bn9svrx9oa04v", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6af96485-a74d-4a01-a952-f9dd41a312ba.jpg", "isFeatured": false}, {"id": "cmbgo4fgu001dn9sv9ct0hob0", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/0e0489ae-8d8e-4aba-9b67-97e618906372.jpg", "isFeatured": false}, {"id": "cmbgo4foy001fn9svt4uc8hhk", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/d219e187-2abf-4fe5-bbbc-09199f61bf6a.jpg", "isFeatured": false}, {"id": "cmbgo4g1g001hn9svukjbi3hg", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/91454869-c1e9-4e95-9b4e-5018e3158815.jpg", "isFeatured": false}, {"id": "cmbgo4g6n001jn9svn8d29cxm", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/9efb9622-83d4-45f9-83cd-7a00c5913edb.jpg", "isFeatured": false}, {"id": "cmbgo4g98001ln9svgp45oynw", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/a9c91bc0-ae74-4daa-b4a1-d06768d0e6e9.jpg", "isFeatured": false}, {"id": "cmbgo4gbn001nn9sv9o315wmk", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ffdcb87a-3fe5-4d58-8b5c-a2b60ab24529.jpg", "isFeatured": false}, {"id": "cmbgo4ge2001pn9svp75okocm", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/2bdbb929-f6f0-4b0b-a398-6df10a921eef.jpg", "isFeatured": false}, {"id": "cmbgo4ggl001rn9svwllb60nt", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ed0e93ac-e016-43a3-9dfc-9d4cfebf3b7b.jpg", "isFeatured": false}, {"id": "cmbgo4umw001xn9svqocy8ond", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/ae76d533-fab4-45e4-b6be-dc9ff9ab1b7f.jpg", "isFeatured": true}, {"id": "cmbgo4upp001zn9svhdvg7sjw", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/16451347-0635-4120-83fe-b954bf1c6616.jpg", "isFeatured": false}, {"id": "cmbgo4usc0021n9sv6my7kadk", "path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/28611052-459c-421a-8322-beed4ed50ea2.jpg", "isFeatured": false}]}	2025-06-03 15:29:57.458	images
cmbgodd7w0003jm04v2agw72e	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-03 15:30:09.069	update
cmbhxq8mr0003n9vnm8xoivok	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/6747ef0f-aef3-4970-b36e-b33a5b5c294d.jpg", "size": "3238KB", "filename": "20250504_120016.jpg"}]}	2025-06-04 12:39:52.371	images
cmbhxq9oc0005n9vnpy40mx7w	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-04 12:39:53.724	update
cmbhy30i4000rn9vnidx9ehju	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/1acf8971-d55d-4dc2-b555-d211a5e3dd01.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/843ec1a4-8b8a-4156-870d-cf4e99861d81.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/cb18b283-009c-44e9-94d4-cb2680f50835.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/30547755-9b7e-4c5f-b28c-6a6302f3d860.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/a7785b1d-13d6-43e2-a882-2a3273c02984.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/749c7aa6-1f51-44ab-8d2b-b6c7e5eacf9e.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/21c5e28c-2ae1-49a0-8385-58609e4ea9a2.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/dadf48b7-915f-4516-904a-82b220421405.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/75486927-17a6-4984-8cd4-41b476bac9d2.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}, {"path": "https://81ipzxotpmf8rssh.public.blob.vercel-storage.com/76346e64-f4c7-4c7c-b1fc-810298ded7ac.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}]}	2025-06-04 12:49:48.364	images
cmbhy32lp000tn9vn0aly3pc0	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-04 12:49:51.086	update
cmbmhu05y0001n9nn3fh8a1lh	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-07 17:13:45.044	update
cmbmhufen0004n9nn96p46olz	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-07 17:14:04.8	update
cmbmhxf910006n9nnxh3xdcjh	cmawdytyr0001jv04sw80ogdt	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-07 17:16:24.566	update
cmbnue9e00001n9j06salc34h	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"cityId": {"new": "cmbmhu7340002n9nnnqxq9faq", "old": "a7e29ffb-6960-4c3c-9ed6-c0010c139850"}}}	2025-06-08 15:53:11.687	update
cmbnv0gky0001n9suq5hlbay9	cmbgnbzur0003n9svtri8yo3g	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"cityId": {"new": "a7e29ffb-6960-4c3c-9ed6-c0010c139850", "old": "cmbmhu7340002n9nnnqxq9faq"}}}	2025-06-08 16:10:27.443	update
\.


--
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
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."User" (id, name, username, password, phone, "createdAt", "updatedAt", photo) FROM stdin;
cma2nicl30000jo04dsn1zx6i	Ирина	irina	$2b$10$892viKMfU8oZcIAkHzL7Je.oB3obHAjpmyaP1kWqqTbgWAZ0bTh1K	+79624441579	2025-04-29 15:17:33.112	2025-04-29 15:17:33.112	
cmah4r0390000n98ec1sazzvm	Татьяна	dyvkovinka	$2b$10$B.GOSpwQQ164zaqoyiP74uAK4VW4a1mw3eVnNPIWD2NrewSJdoJum		2025-05-09 18:28:56.755	2025-05-09 18:28:56.755	
cma17p91m0000n94r28v2tbcr	Валерий Г.	valeriy	$2b$10$EnkjwGQ53gSWrKJ9EFA7Vue0NJSLlCrtRkgjsy55svWBqGenSLkV.	\N	2025-04-28 15:07:15.082	2025-06-05 17:42:10.132	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5b3092de-db12-4d8f-8537-6f213c70597d	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-04-27 22:56:42.355668+00	20250414131013_init	\N	\N	2025-04-27 22:56:41.611757+00	1
489d6836-68bb-4750-b2d5-38c69ec87721	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-04-27 22:56:43.365843+00	20250414202255_rename_description	\N	\N	2025-04-27 22:56:42.644692+00	1
4838af72-cee9-4a8e-80d0-96833c932a10	ac165b61d6739ecbc3c2e11067894af95671f075718e1bca74fb02efd2fc51f4	2025-05-13 13:56:03.992701+00	20250510_add_property_type_model	\N	\N	2025-05-13 13:56:01.478285+00	1
1f260584-60cb-447a-8d45-a97d5ca6e3dd	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-04-27 22:56:44.400004+00	20250420173452_add_user_photo	\N	\N	2025-04-27 22:56:43.651371+00	1
47800b10-4356-402b-898c-6225b9ef1179	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-04-27 22:56:45.450622+00	20250421193300_add_listing_edit_history	\N	\N	2025-04-27 22:56:44.725302+00	1
c041445d-a81a-4897-8ee6-7c2fd778e645	dda7fabbc5b70bb16b5a2350b7ea7f6c78f1e92834452d2162302edfc447e209	\N	undo_property_types	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: undo_property_types\n\nDatabase error code: 42501\n\nDatabase error:\nERROR: must be owner of table Listing\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42501), message: "must be owner of table Listing", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("aclchk.c"), line: Some(2981), routine: Some("aclcheck_error") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="undo_property_types"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="undo_property_types"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	\N	2025-05-16 22:22:34.277496+00	0
e270b61d-42ee-45f9-89fc-020d9721ee82	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-04-27 22:56:46.458485+00	20250421200226_add_listing_history	\N	\N	2025-04-27 22:56:45.733836+00	1
7cfb3ebd-7dd0-42d7-b92e-3aba2ba31ad8	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-05-31 13:31:47.452815+00	20250520000000_add_coordinates_to_listings		\N	2025-05-31 13:31:47.452815+00	0
59459e44-be25-4af1-a33c-f4dadd545885	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-04-27 22:56:47.468463+00	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-04-27 22:56:46.745317+00	1
6b92b4f4-56d8-4f25-89b0-1fa215b02349	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-07 15:16:51.95183+00	20250607181619_make_property_type_optional		\N	2025-06-07 15:16:51.95183+00	0
2203f926-21a9-4a1a-b73b-a09eb241406e	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-05-02 17:38:43.300008+00	20250502173835_update_listing_fields	\N	\N	2025-05-02 17:38:42.380799+00	1
ed68603f-7ac0-49e0-9b8f-0e93e224702d	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-07 16:50:11.771279+00	20250610000000_add_city_model_and_field		\N	2025-06-07 16:50:11.771279+00	0
39a54acd-052e-4f26-965b-be862f1d3221	44be1fdc94dbe05522919c40dd9e8075b506fe9cf28806acaeb6e872368ea416	2025-05-10 13:46:11.379511+00	20250510134606_add_district_model	\N	\N	2025-05-10 13:46:10.919845+00	1
283f2755-41b2-486f-90ce-49989c6027fb	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-07 17:09:50.806849+00	20250620000000_make_city_optional		\N	2025-06-07 17:09:50.806849+00	0
cdc13f63-b549-4cfb-aaea-ba133741b476	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	\N	20250510_manual_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510_manual_add_district_model\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "District" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"District\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1159), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225	2025-05-10 13:56:30.383282+00	2025-05-10 13:55:28.915369+00	0
94b38ec3-2a62-42ac-94c7-7d57ded6a766	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-05-10 13:56:30.651235+00	20250510_manual_add_district_model		\N	2025-05-10 13:56:30.651235+00	0
\.


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- Name: District District_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);


--
-- Name: Image Image_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_pkey" PRIMARY KEY (id);


--
-- Name: ListingHistory ListingHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_pkey" PRIMARY KEY (id);


--
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- Name: PropertyType PropertyType_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PropertyType"
    ADD CONSTRAINT "PropertyType_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: City_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "City_slug_key" ON public."City" USING btree (slug);


--
-- Name: District_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "District_slug_key" ON public."District" USING btree (slug);


--
-- Name: Listing_listingCode_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "Listing_listingCode_key" ON public."Listing" USING btree ("listingCode");


--
-- Name: PropertyType_slug_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "PropertyType_slug_key" ON public."PropertyType" USING btree (slug);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Comment Comment_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Image Image_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ListingHistory ListingHistory_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ListingHistory ListingHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Listing Listing_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Listing Listing_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Listing Listing_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Listing Listing_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."PropertyType"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Listing Listing_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PropertyType PropertyType_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."PropertyType"
    ADD CONSTRAINT "PropertyType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

