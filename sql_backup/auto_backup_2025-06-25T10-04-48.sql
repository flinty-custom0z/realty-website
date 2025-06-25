--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 17.5 (Homebrew)

-- Started on 2025-06-25 13:04:48 MSK

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

DROP DATABASE IF EXISTS oporadom_test;
--
-- TOC entry 3784 (class 1262 OID 26701)
-- Name: oporadom_test; Type: DATABASE; Schema: -; Owner: test_user
--

CREATE DATABASE oporadom_test WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE oporadom_test OWNER TO test_user;

\connect oporadom_test

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: test_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO test_user;

--
-- TOC entry 3785 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: test_user
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 831 (class 1247 OID 26703)
-- Name: BalconyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BalconyType" AS ENUM (
    'BALCONY',
    'LOGGIA',
    'BOTH',
    'NONE'
);


ALTER TYPE public."BalconyType" OWNER TO postgres;

--
-- TOC entry 834 (class 1247 OID 26712)
-- Name: BathroomType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BathroomType" AS ENUM (
    'COMBINED',
    'SEPARATE',
    'MULTIPLE'
);


ALTER TYPE public."BathroomType" OWNER TO postgres;

--
-- TOC entry 837 (class 1247 OID 26720)
-- Name: BuildingType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BuildingType" AS ENUM (
    'BRICK',
    'PANEL',
    'MONOLITH',
    'OTHER',
    'MONOLITH_BRICK'
);


ALTER TYPE public."BuildingType" OWNER TO postgres;

--
-- TOC entry 840 (class 1247 OID 26732)
-- Name: DealType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DealType" AS ENUM (
    'SALE',
    'RENT'
);


ALTER TYPE public."DealType" OWNER TO postgres;

--
-- TOC entry 843 (class 1247 OID 26738)
-- Name: WindowsView; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."WindowsView" AS ENUM (
    'COURTYARD',
    'STREET',
    'BOTH'
);


ALTER TYPE public."WindowsView" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 209 (class 1259 OID 26745)
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- TOC entry 210 (class 1259 OID 26750)
-- Name: City; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."City" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."City" OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 26755)
-- Name: Comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Comment" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Comment" OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 26761)
-- Name: District; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."District" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."District" OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 26766)
-- Name: Image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Image" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    path text NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Image" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 26772)
-- Name: Listing; Type: TABLE; Schema: public; Owner: postgres
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
    "cityId" text,
    slug text
);


ALTER TABLE public."Listing" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 26783)
-- Name: ListingHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ListingHistory" (
    id text NOT NULL,
    "listingId" text NOT NULL,
    "userId" text NOT NULL,
    changes jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action text DEFAULT 'update'::text NOT NULL
);


ALTER TABLE public."ListingHistory" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 26790)
-- Name: PropertyType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PropertyType" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public."PropertyType" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 26795)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 26801)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 3769 (class 0 OID 26745)
-- Dependencies: 209
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 3770 (class 0 OID 26750)
-- Dependencies: 210
-- Data for Name: City; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."City" (id, name, slug) FROM stdin;
78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	Краснодар	krasnodar
cmbtnkxrf0000jr040xylvgsh	ст. Елизаветинская	ст-елизаветинская
\.


--
-- TOC entry 3771 (class 0 OID 26755)
-- Dependencies: 211
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Comment" (id, "listingId", content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 3772 (class 0 OID 26761)
-- Dependencies: 212
-- Data for Name: District; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."District" (id, name, slug) FROM stdin;
cmaianwry0000n9hb03zlv221	Прикубанский округ	prikubanskij-okrug
cmal7i3r30000n9jb49irduyh	Центральный	tsentralnyy
cmbw7i45g0002n9sh6sc8thrb	Адыгея	adygeya
cmbw8gjn30008l5046qgvlagl	Капасунский	kapasunskiy
cmbw8hd8z0009l504mmio8nwo	Карасунский	karasunskiy
cmbw8i29q000al504j8j8rsj7	Западный	zapadnyy
\.


--
-- TOC entry 3773 (class 0 OID 26766)
-- Dependencies: 213
-- Data for Name: Image; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Image" (id, "listingId", path, "isFeatured") FROM stdin;
cmc0fhyf5000dl5049b59kgf3	cmc0fhxzc0009l504lz60laxs	/images/apartments_placeholder.png	t
cmbyx62z00005jl040n7x5p7f	cmbyx61ju0001jl04yja2j1bd	/uploads/listings/60e5f531-2b88-4b59-86a3-e3808a3a73e6.jpg	t
cmbw6lhv30005ih047hu4rirr	cmbw6lfyb0001ih04jh7j8yo8	/uploads/listings/32d3bb8e-79c2-4662-b5bb-197e90e45c8d.jpg	t
cmbw7p7qn0005ky0476dpt9vs	cmbw7p4620001ky04qjh8u4x4	/uploads/listings/3eaa5799-4ccb-46f5-a873-ad524e1dd5e3.jpg	t
cmbw7p7vs0007ky043r3qb09h	cmbw7p4620001ky04qjh8u4x4	/uploads/listings/fa15d7c1-9400-4c5c-8c0d-d8d1082610a2.jpg	f
cmbw7p7yd0009ky04iaacgquk	cmbw7p4620001ky04qjh8u4x4	/uploads/listings/63677862-763f-4d17-b37c-331a6dba2c8c.jpg	f
cmbw7p80y000bky0420lwqrf6	cmbw7p4620001ky04qjh8u4x4	/uploads/listings/7b08baea-868b-4f07-bc0c-3f9bf8828739.jpg	f
cmbw8bhzo0005l504zp1mgvn5	cmbw8bg6w0001l504grutg3o6	/uploads/listings/321ad43d-75ed-4761-a239-54481e05e9bb.jpg	t
cmbt6snrf0001l804e5btq6p8	cmbt6qogb0001jv04651cnmyz	/uploads/listings/1f3a4e6f-7aac-414c-a7a8-7d725a8d5afa.jpg	f
cmbtk2dpd0001n919jm9v81h3	cmbt6qogb0001jv04651cnmyz	/uploads/listings/e96986e7-7ea4-4438-9dc4-988baae54e88.jpg	f
cmbtka9vx0007n919q7bcikwc	cmbt6qogb0001jv04651cnmyz	/uploads/listings/9703dcc3-183f-48b4-9c17-4fc38754cb65.jpg	f
cmbtkha1e000dn9191k7stf2n	cmbt6qogb0001jv04651cnmyz	/uploads/listings/dc89636e-0d81-48c1-bc16-bfde11c20676.jpg	f
cmbtkjns3000jn919wji792g3	cmbt6qogb0001jv04651cnmyz	/uploads/listings/47a596ab-7417-4fa3-b11a-11d40a68778d.jpg	f
cmbw8qd0x0005lk04iovcfc8j	cmbw8qbcg0001lk040x6hhjs0	/uploads/listings/1ee8608f-d98f-47ab-a700-ac67cf928d13.jpg	t
cmbtnymx20009lb040f6bj4lx	cmbtny34g0001lb04v5ccsltp	/uploads/listings/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg	f
cmbtlbace0001n9igyhx6b4l8	cmbt6qogb0001jv04651cnmyz	/uploads/listings/65115e66-5ffe-418a-ac35-e3b2893a0509.jpg	f
cmbtlbal90003n9igxb40s2sb	cmbt6qogb0001jv04651cnmyz	/uploads/listings/641cc412-d2de-459d-af6f-5e389ef57958.jpg	f
cmbtlbapa0005n9igv2iwvywl	cmbt6qogb0001jv04651cnmyz	/uploads/listings/4e7fd17f-e5ef-46f2-af9b-4b98b701b6c2.jpg	f
cmbtlbata0007n9iguhmx5qpm	cmbt6qogb0001jv04651cnmyz	/uploads/listings/dadb8915-83e4-4d21-a57d-30dd10263420.jpg	f
cmbtj3qzs0001n9g776viw8az	cmbt6qogb0001jv04651cnmyz	/uploads/listings/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg	f
cmbtib9910003n980qgpoteos	cmbt6qogb0001jv04651cnmyz	/uploads/listings/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg	t
cmbtm2bxm000dn9ignfb76gxp	cmbt6qogb0001jv04651cnmyz	/uploads/listings/f0b34b18-367a-4ff3-8331-da74499c38d8.jpg	t
cmbyxec7g000djl04ca2f0cgp	cmbyxeas20009jl0477k63b9x	/uploads/listings/35e80e60-1727-4eab-b17a-bc22fbbdbd05.jpg	t
cmbzcbkiz0005jy04xfm5cjn8	cmbzcbive0001jy04cor6y5vp	/uploads/listings/07476330-75d9-412f-ac16-da4cc73efe7f.jpg	t
cmbzdcz430005l104rid8hr7o	cmbzdcxe50001l104zymr6adk	/uploads/listings/2800e1d1-fc74-42e2-95a0-d5fe7645c130.jpg	t
cmbzdu02q000dl104chctpvyl	cmbzdtyge0009l104st0ti06v	/uploads/listings/3996b6da-dccc-4db7-ac85-2e21f8f25100.jpg	t
cmbzfew1n0005l4049c3mbw5r	cmbzfeu2m0001l404bz3gau95	/uploads/listings/3a62c90b-ca19-4a62-9f66-90f03942b21c.jpg	t
cmc0blmf30005i404jgvfcwmd	cmc0blkgu0001i404rwszqlt4	/uploads/listings/a9871d81-7539-4595-be3f-45d4c24d30ed.jpg	t
cmc0dquaj0005jp041knark3u	cmc0dqsng0001jp045rk6eltj	/uploads/listings/f2ffd6bf-66c8-44e5-947e-b4b26ffbfe35.jpg	t
cmc0e0j1i0005ie04cq2rf6zw	cmc0e0hns0001ie04xazcx1q5	/uploads/listings/11aeda21-9c42-42cd-94ba-5754e0134b0c.jpg	t
cmbv03ach0003n9ts5b5dze8z	cmbtny34g0001lb04v5ccsltp	/uploads/listings/7822c662-a0f5-4dc0-a92f-d9c55cf0b66a.jpg	f
cmbv03am50005n9ts38wf97cs	cmbtny34g0001lb04v5ccsltp	/uploads/listings/118e2fea-513d-4dfb-8a51-51ca51f97fe4.jpg	f
cmbv03ar40007n9tsoitvk8np	cmbtny34g0001lb04v5ccsltp	/uploads/listings/de99f342-a146-4887-a817-63be32448576.jpg	f
cmbv03avo0009n9tsfx3iczkw	cmbtny34g0001lb04v5ccsltp	/uploads/listings/8c69ff13-995b-4cbb-a7cb-06dfb2c62aba.jpg	f
cmbv03b0e000bn9tsbv0rua2y	cmbtny34g0001lb04v5ccsltp	/uploads/listings/12326a9b-d2d2-410b-a913-197a84a70a86.jpg	f
cmbv03b4y000dn9tshm0spwhn	cmbtny34g0001lb04v5ccsltp	/uploads/listings/ebcfe7cd-deb3-4822-afc5-4b59af32b776.jpg	f
cmc0e6jy60005l404f2jh0xbd	cmc0e6ic60001l4041sbcd69g	/uploads/listings/ef246c63-20be-452f-9ea2-ce54211913f7.jpg	t
cmbv03bai000fn9ts2uqv54sa	cmbtny34g0001lb04v5ccsltp	/uploads/listings/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg	t
cmbywgc2n0005jp04mn7kzoyi	cmbywgaeo0001jp04i1bno336	/uploads/listings/c07064ae-82da-40f1-87a3-12dd7bf8417a.jpg	t
cmbywvqba0005li0488hl2rq4	cmbywvor80001li04b06177j5	/uploads/listings/ba6eb0ba-e459-4734-b701-5f3c16529a60.jpg	t
cmc0ei8rq000die045es0di7d	cmc0ei7px0009ie04tn1ihmvt	/uploads/listings/203c33b1-4fdb-4784-b7b5-9731ef8ea539.jpg	t
cmc0evl9k0005l504sah7ydjo	cmc0evjtm0001l504z6uo7t2f	/uploads/listings/1e0e5b5f-8e15-40f2-9d5a-414689c7f6d0.jpg	t
cmc0f37vt0005ld04blnzcn2w	cmc0f369e0001ld04gwcm2kcz	/uploads/listings/8ea18c92-0c3d-4ec7-ae9e-e60a86179aac.jpg	t
cmc0fot60000dld04n91qpnnm	cmc0forfn0009ld04zx62jqfa	/uploads/listings/f0085448-2b5a-4085-b400-2df24480811f.jpg	t
cmbtn8afz0005la04twmp9aoh	cmbtn88dl0001la040vdj2wwv	/uploads/listings/cbb912e2-9a8e-4496-a19c-92a0868abcb0.jpg	t
cmc0g95mx0005jr04gd1tu4z5	cmc0g947t0001jr04i6pi12ow	/uploads/listings/494786c3-8e13-440f-889b-088a9c87bc2f.jpg	t
cmc0gf0ap0005lb04o2l1epr1	cmc0geyh10001lb0402e2oqdo	/uploads/listings/fc04bd89-2dbf-421c-862e-53efdf2ec580.jpg	t
cmc1mgdfu0005if04sis00nea	cmc1mgbw30001if04vmqbpha1	/uploads/listings/128dfbdb-de19-4c89-8db2-491143a25e5c.jpg	t
cmc1nlttl0005l704xuw6gpvb	cmc1nls2y0001l704d7z81uph	/uploads/listings/3826116d-122a-4ce3-8d29-8df49779da3d.jpg	t
cmc1nuuci0005jj04rap7im7m	cmc1nusum0001jj04gg4pocmb	/uploads/listings/f52e6d91-72dd-40d9-bac8-a229e57798d5.jpg	t
cmc1o2ih5000dl704txbgedq3	cmc1o2hje0009l704f42bxnyg	/uploads/listings/930d5e3b-6b17-484b-88dd-ad7548dec245.jpg	t
cmc1o9vq00005k304o6roffpa	cmc1o9u6h0001k304hfk6ls9c	/uploads/listings/aefd19fc-72c8-4e4c-81df-9876ec0d85d4.jpg	t
cmc1oeml2000djj04xqwm3b43	cmc1oel2n0009jj04z49g0x4h	/uploads/listings/a498b988-9d94-482c-b549-bc49b0f5ad72.jpg	t
cmc1ojqwi000dk304z1c3nt5f	cmc1ojph20009k304e30nhtsq	/uploads/listings/f3ca0f08-58e7-4681-8054-85bdf5e9b5c4.jpg	t
cmc1oucub000ll704wzf34mub	cmc1oubbt000hl704t4bk4k5p	/uploads/listings/99dcbbb7-ccee-4a4c-a5d3-50bca310b017.jpg	t
cmc1ozkin000nk304hn14rrpz	cmc1ozj15000jk304a6gmdppl	/uploads/listings/3c6d2b01-410d-4f9a-bd74-cc42791c9ef2.jpg	t
cmc1pvu400005lc04ktue0ozh	cmc1pvslk0001lc048lnqmzi5	/uploads/listings/5deac965-620f-4118-8072-0c896327e610.jpg	t
cmc1q5rzy0005ld04tbzy3bds	cmc1q5qc00001ld04c6fxrjdu	/uploads/listings/1ebe0092-81a6-4cb8-a370-3a045abbff6d.jpg	t
cmc1qts300005l804opanr440	cmc1qtq990001l804uiwh34w8	/uploads/listings/f1367cd4-f133-441c-b016-dca521fc381e.jpg	t
cmc3lclf80007n9qr9w7e6igs	cmc3lcl3b0003n9qrb9ouwj99	/uploads/listings/4312af4f-1244-4bfd-9f3f-5bedea78a930.jpg	t
\.


--
-- TOC entry 3774 (class 0 OID 26772)
-- Dependencies: 214
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Listing" (id, "categoryId", "userId", address, "houseArea", "landArea", floor, "totalFloors", condition, "yearBuilt", "noEncumbrances", price, currency, "dateAdded", "listingCode", status, "adminComment", "publicDescription", "dealType", "balconyType", "bathroomType", "buildingType", "kitchenArea", "noShares", "windowsView", "typeId", "districtId", title, latitude, longitude, "fullAddress", "cityId", slug) FROM stdin;
cmc0forfn0009ld04zx62jqfa	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Гидростроителей, 59/2	45.6	\N	18	\N	Предчистовая	\N	f	3900000	₽	2025-06-17 11:22:27.683	К-4999	active	\N	Продается 1 ком квартира	SALE	BALCONY	\N	MONOLITH_BRICK	\N	f	STREET	559c2a97-40b4-4fcc-80be-618c18f07f55	cmbw8hd8z0009l504mmio8nwo	1-комнатная квартира 45.6 м²	45.001957	39.087162	Россия, Краснодар, улица Гидростроителей, 59/2	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0f369e0001ld04gwcm2kcz	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Калининский переулок, 26	\N	52.3	2	3	Хорошее	\N	f	6000000	₽	2025-06-17 11:05:40.467	К-2481	active	\N	Продается 2-х ком квартира	SALE	\N	SEPARATE	BRICK	\N	f	COURTYARD	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира	45.047985	39.021783	Россия, Краснодар, Калининский переулок, 26	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0ei7px0009ie04tn1ihmvt	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени 40-летия Победы, 146/7	51	\N	7	9	Хорошее	\N	f	5300000	₽	2025-06-17 10:49:22.582	К-8436	active	\N	Продается 2-х комнатная квартира	SALE	BALCONY	SEPARATE	BRICK	\N	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 51 м²	45.052073	39.021145	Россия, Краснодар, улица имени 40-летия Победы, 146/7	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0evjtm0001l504z6uo7t2f	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени 40-летия Победы, 97/1	35.2	\N	1	16	Хорошее	\N	f	4200000	₽	2025-06-17 10:59:44.794	К-6181	active	\N	Продается 1-ком квартира 	SALE	\N	COMBINED	PANEL	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 35.2 м²	45.057148	39.02932	Россия, Краснодар, улица имени 40-летия Победы, 97/1	\N	\N
cmbtn88dl0001la040vdj2wwv	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Цезаря Куникова, 24к1	71	\N	7	16	Требуется ремонт	\N	t	6750000	₽	2025-06-12 17:19:10.186	К-5679	active	\N	🏢 Просторная квартира в престижном районе Метальникова\r\n\r\nПредставляем вашему вниманию великолепную квартиру, расположенную в одном из самых комфортных районов города! \r\n\r\n✨ Основные характеристики:\r\n• Общая площадь: 71 м²\r\n• Этаж: 7 из 16 (идеальный вариант без шума сверху и снизу)\r\n• Функциональная планировка Евро-формата\r\n• Светлая и просторная гостиная 20 м² с выходом на уютную лоджию (10 м²)\r\n\r\n🏠 Особый комфорт:\r\n• Продуманная планировка\r\n• Продуманное расположение окон\r\n• Возможность организовать зону отдыха с выходом на лоджию\r\n• Функциональная кухня-гостиная\r\n\r\n🏗 Развитая инфраструктура района:\r\n• В пешей доступности магазины, школы и детские сады\r\n• Удобная транспортная развязка\r\n• Благоустроенный двор\r\n• Парковочные места\r\n\r\nЭта квартира станет вашим идеальным гнездышком для комфортной жизни в одном из самых перспективных районов города! \r\n\r\nЗаписывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! \r\n\r\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!	SALE	LOGGIA	COMBINED	MONOLITH	10	t	COURTYARD	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 71 м²	45.099308	39.001409	Россия, Краснодар, улица Цезаря Куникова, 24к1	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	2-komnatnaya-kvartira-71-m
cmc0geyh10001lb0402e2oqdo	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Западный Обход, 39/2к5	53.9	\N	1	18	Хорошее	\N	f	7150000	₽	2025-06-17 11:42:49.861	К-6755	active	\N	Продается 2- км квартира	SALE	BALCONY	COMBINED	MONOLITH_BRICK	\N	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmbw8i29q000al504j8j8rsj7	2-комнатная квартира 53.9 м²	45.092805	38.904131	Россия, Краснодар, улица Западный Обход, 39/2к5	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0g947t0001jr04i6pi12ow	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Западный Обход, 39/2к2	50	\N	1	18	Хорошее	\N	t	6900000	₽	2025-06-17 11:38:17.369	К-4020	active	\N	Продается 2-ком квартира	SALE	LOGGIA	COMBINED	MONOLITH_BRICK	\N	t	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmbw8i29q000al504j8j8rsj7	2-комнатная квартира 50 м²	45.093817	38.904131	Россия, Краснодар, улица Западный Обход, 39/2к2	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0fhxzc0009l504lz60laxs	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени Снесарева, 10к1	38.2	\N	5	23	Хорошее	\N	f	4900000	₽	2025-06-17 11:17:09.576	К-4907	active	\N	Продается 1 ком квартира	SALE	\N	\N	MONOLITH_BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmbw8hd8z0009l504mmio8nwo	1-комнатная квартира 38.2 м²	44.996304	39.078682	Россия, Краснодар, улица имени Снесарева, 10к1	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1mgbw30001if04vmqbpha1	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Воронежская улица, 47/10	31	\N	7	17	Предчистовая	\N	f	5050000	₽	2025-06-18 07:19:37.779	К-2670	active	\N	Продается 1-комнатная квартира	SALE	BALCONY	COMBINED	MONOLITH_BRICK	11.8	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmbw8hd8z0009l504mmio8nwo	1-комнатная квартира 31 м²	44.999797	39.03117	Россия, Краснодар, Воронежская улица, 47/10	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbt6qogb0001jv04651cnmyz	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени 40-летия Победы, 101	54.3	\N	8	16	\N	\N	f	5300000	₽	2025-06-12 09:37:37.356	К-9378	active	Наш ЭКС	**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\r\n\r\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\r\n\r\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\r\n\r\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\r\n\r\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\r\n\r\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\r\n\r\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\r\n\r\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!	SALE	\N	\N	\N	11	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	\N	2-комнатная квартира 54.3 м²	45.058816	39.02967	Россия, Краснодар, улица имени 40-летия Победы, 101	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	2-komnatnaya-kvartira-543-m
cmbw6lfyb0001ih04jh7j8yo8	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Героев-Разведчиков, 48	\N	\N	\N	\N	Хорошее	\N	t	12800000	₽	2025-06-14 11:56:51.587	К-6008	active	\N	🏢 РОСКОШНАЯ ДВУХКОМНАТНАЯ КВАРТИРА В ПРЕСТИЖНОМ РАЙОНЕ\r\n\r\nПредставляем вашему вниманию великолепную двухкомнатную квартиру, расположенную в одном из самых комфортных для проживания районов города!\r\n\r\n✨ О КВАРТИРЕ:\r\n• Продуманная планировка\r\n• Светлая и просторная кухня с выходом на лоджию\r\n• Уютная прихожая большого размера\r\n• Две светлые и комфортные комнаты\r\n• Раздельный санузел с современной сантехникой\r\n• Выполнен качественный косметический ремонт\r\n\r\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\r\n• Закрытая территория с ограниченным доступом\r\n• Вход по электронному ключу или домофону\r\n• Благоустроенный двор с современными детскими площадками\r\n• Зелёная зона для спокойных прогулок\r\n• Оборудованная площадка для выгула домашних питомцев\r\n• Доброжелательные соседи\r\n\r\n📍 ПРЕИМУЩЕСТВА РАСПОЛОЖЕНИЯ:\r\n• Развитая инфраструктура: магазины, школы, детские сады, поликлиника – всё в шаговой доступности\r\n• В самом доме: продуктовые магазины, аптеки, пекарни, салоны красоты\r\n• Отличная транспортная доступность – остановки общественного транспорта рядом\r\n• Уединённое расположение вдали от проезжей части\r\n\r\nЭта квартира создана для комфортной жизни! Здесь каждый найдёт своё идеальное пространство: от просторной кухни до уютных спален.\r\n\r\nНе упустите возможность стать владельцем этой замечательной квартиры! Запишитесь на просмотр прямо сейчас и откройте для себя новый уровень комфортной жизни в одном из лучших районов города!\r\n\r\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!	SALE	LOGGIA	SEPARATE	PANEL	\N	t	COURTYARD	d4d608d6-f69a-4030-bd5b-1d73dc243be2	cmaianwry0000n9hb03zlv221	3-комнатная квартира	45.068792	39.033605	Россия, Краснодар, улица Героев-Разведчиков, 48	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	3-komnatnaya-kvartira
cmbw8bg6w0001l504grutg3o6	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Петра Метальникова, 40	79.1	\N	16	21	Предчистовая	\N	t	8200000	₽	2025-06-14 12:45:04.568	К-1299	active	\N	🏢 ПРЕМИАЛЬНАЯ ТРЕХКОМНАТНАЯ КВАРТИРА В ЖИЛОМ КОМПЛЕКСЕ «ЛУЧШИЙ»\r\n\r\nПредставляем вашему вниманию великолепную трехкомнатную квартиру, расположенную в современном жилом комплексе комфорт+ класса!\r\n\r\n✨ ОСНОВНЫЕ ХАРАКТЕРИСТИКИ:\r\n• Общая площадь: 79,1 м²\r\n• Жилая площадь: продуманная планировка\r\n• Просторная кухня: 15 м²\r\n• 18 этаж из 24\r\n• Окна с великолепным видом на город\r\n\r\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\r\n• Надежный застройщик ССК\r\n• Дом сдан и активно заселяется\r\n• Закрытая территория с видеонаблюдением\r\n• Благоустроенный двор без машин\r\n• Детская площадка для комфортного отдыха\r\n• Наземная и гостевая парковка\r\n• Пассажирский и грузовой лифты\r\n\r\n📍 ЛОКАЦИЯ И ИНФРАСТРУКТУРА:\r\n• Развитая инфраструктура района\r\n• Школы и детские сады в шаговой доступности\r\n• Магазины Табрис и Пятёрочка рядом\r\n• Сбербанк, Ozon, Wildberries – всё под рукой\r\n• Удобная транспортная развязка, включая трамвайную линию\r\n\r\n🛋 ДОПОЛНИТЕЛЬНЫЕ ПРЕИМУЩЕСТВА:\r\n• Раздельный санузел\r\n• Качественные пластиковые окна\r\n• Индивидуальное отопление\r\n• Установлены счётчики на воду\r\n• Домофон и железная дверь\r\n• Улучшенная черновая отделка\r\n• Возможность реализации любых дизайнерских решений\r\n\r\nЭта квартира – идеальный выбор для комфортной жизни всей семьи! Продуманная планировка, два просторных балкона и великолепный вид на город делают её уникальной.\r\n\r\nНе упустите шанс стать владельцем этой замечательной квартиры! Записывайтесь на просмотр в любое удобное время.\r\n\r\n📞 Звоните прямо сейчас, чтобы узнать все подробности и договориться о встрече!	SALE	LOGGIA	COMBINED	MONOLITH_BRICK	\N	t	COURTYARD	d4d608d6-f69a-4030-bd5b-1d73dc243be2	cmaianwry0000n9hb03zlv221	3-комнатная квартира 79.1 м²	45.097876	39.001292	Россия, Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Петра Метальникова, 40	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbw7p4620001ky04qjh8u4x4	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Республика Адыгея (Адыгея), Тахтамукайский район, Старобжегокайское сельское поселение, аул Новая Адыгея, Бжегокайская улица, 90/5к2	\N	\N	1	5	Предчистовая	\N	t	3300000	₽	2025-06-14 12:27:42.554	К-6443	active	\N	🏢 ПРОСТОРНАЯ ОДНОКОМНАТНАЯ КВАРТИРА В ЖИЛОМ КОМПЛЕКСЕ “МЕГА”\r\n\r\nПредлагается на продажу уютная однокомнатная квартира, расположенная в современном жилом комплексе комфорт-класса!\r\n\r\n✨ ХАРАКТЕРИСТИКИ КВАРТИРЫ:\r\n• Общая площадь: 39,8 м²\r\n• Жилая площадь: 15,3 м²\r\n• Площадь кухни: 10,5 м²\r\n• 1 этаж из 5\r\n• Без ремонта – идеально для реализации ваших дизайнерских идей!\r\n• Совмещенный санузел\r\n• Утепленный балкон с видом на улицу\r\n\r\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\r\n• Современный жилой комплекс с благоустроенной территорией\r\n• Наземная парковка для жильцов\r\n• Подъезд с качественным ремонтом\r\n• Грузовой и пассажирский лифты\r\n• Круглосуточная охрана и видеонаблюдение\r\n\r\n📍 ЛОКАЦИЯ:\r\n• Тахтамукайский район, аул Новая Адыгея\r\n• Развитая инфраструктура: магазины, школы, детские сады в шаговой доступности\r\n• Удобная транспортная развязка\r\n\r\n\r\n📈 УСЛОВИЯ ПРОДАЖИ:\r\n• Свободная продажа\r\n• Возможность оформления ипотеки\r\n• Один собственник\r\n• Быстрый выход на сделку\r\n• Помощь в одобрении ипотеки \r\n\r\nЭта квартира станет отличным выбором как для собственного проживания, так и для инвестиций. Просторная планировка и удачное расположение делают её привлекательной для молодых семей и тех, кто ценит комфорт и удобство!\r\n\r\nНе упустите шанс стать владельцем этой замечательной квартиры! Записывайтесь на просмотр прямо сейчас!\r\n\r\n📞 Свяжитесь с нами для получения подробной информации и организации просмотра!	SALE	\N	COMBINED	BRICK	10.5	t	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmal7i3r30000n9jb49irduyh	1-комнатная квартира	45.01569	38.91111	Россия, Республика Адыгея (Адыгея), Тахтамукайский район, Старобжегокайское сельское поселение, аул Новая Адыгея, Бжегокайская улица, 90/5к2	\N	1-komnatnaya-kvartira
cmc1o9u6h0001k304hfk6ls9c	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени Героя Николая Шевелёва, 3	60.7	\N	17	17	Хорошее	\N	f	8100000	₽	2025-06-18 08:10:34.121	К-7982	active	\N	Продается 2 ком квартира	SALE	BALCONY	SEPARATE	MONOLITH_BRICK	\N	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 60.7 м²	45.074744	39.03762	Россия, Краснодар, улица имени Героя Николая Шевелёва, 3	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1nls2y0001l704d7z81uph	cma17xip50001n97czf8u3mhm	cma17p91m0000n94r28v2tbcr	Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/7	70	\N	\N	\N	Предчистовая	\N	f	6200000	₽	2025-06-18 07:51:51.658	Д-9202	active	\N	Продается дом ПЧО	SALE	\N	COMBINED	BRICK	\N	f	COURTYARD	a16b51bb-e859-42bd-bb86-98fd314fadd7	cmaianwry0000n9hb03zlv221	Дом 70 м²	45.086416	39.080623	Россия, Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/7	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbw8qbcg0001lk040x6hhjs0	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Селезнёва, 126	43.9	\N	2	9	Хорошее	1979	t	5700000	₽	2025-06-14 12:56:38.129	К-7710	active	\N	🏢 Уютная двухкомнатная квартира в кирпичном доме в развитом районе города!\r\n\r\n✨ ПРЕДЛАГАЕТСЯ НА ПРОДАЖУ:\r\n• Общая площадь: 43 м²\r\n• Жилая площадь: 20 м²\r\n• Кухня: 6 м²\r\n• Этаж: 2 из 9\r\n\r\n🏠 О КВАРТИРЕ:\r\n• Полностью выполнен капитальный ремонт\r\n• Установлены новые пластиковые окна\r\n• Декоративная штукатурка на стенах и потолках\r\n• Ламинат и стильная плитка на полу\r\n• В санузле тёплый пол, подвесной унитаз и бойлер\r\n• Новый кухонный гарнитур в кухне\r\n• Удобный шкаф-купе в коридоре\r\n\r\n⚡️ ДОПОЛНИТЕЛЬНЫЕ ПРЕИМУЩЕСТВА:\r\n• Заменены электропроводка и сантехника\r\n• Качественная отделка\r\n• Тёплый и уютный кирпичный дом\r\n• Чистый подъезд\r\n• Благоустроенный двор\r\n\r\n📍 ЛОКАЦИЯ:\r\n• Район Селезнёва – один из самых удобных для проживания\r\n• Развитая инфраструктура: магазины, школы, детские сады\r\n• Отличная транспортная доступность\r\n• В шаговой доступности остановки общественного транспорта\r\n\r\n📈 УСЛОВИЯ ПРОДАЖИ:\r\n• Квартира от собственника\r\n• Без обременений\r\n• Быстрый выход на сделку\r\n• Возможность покупки в ипотеку\r\n• Помощь в одобрении кредита\r\n\r\nЭта квартира идеально подойдёт как для собственного проживания, так и для инвестиций. Полностью готова к заселению и не требует дополнительных вложений!\r\n\r\nНе упустите шанс стать владельцем этой замечательной квартиры в развитом районе города! Записывайтесь на просмотр прямо сейчас!\r\n\r\n📞 Звоните для получения подробной информации и организации просмотра!	SALE	\N	\N	BRICK	\N	t	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmbw8hd8z0009l504mmio8nwo	2-комнатная квартира 43.9 м²	45.023552	39.040989	Россия, Краснодар, улица Селезнёва, 126	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbtny34g0001lb04v5ccsltp	cma17xip50001n97czf8u3mhm	cma17p91m0000n94r28v2tbcr	городской округ Краснодар, станица Елизаветинская	161	7	\N	\N	\N	\N	f	10000000	₽	2025-06-12 17:39:16.432	Д-8500	active	\N	Элитное предложение в СНТ «Родничок», ст. Елизаветинская — ваш идеальный загородный дом!\r\n\r\n---\r\n\r\n### 🏡 Основные характеристики:\r\n\r\n**Площадь**\r\n\r\n* Дом – **161 м²**, на участке **7 соток** земли.\r\n\r\n**Инженерные коммуникации**\r\n\r\n* Своя **скважина с питьевой водой**;\r\n* Подведены **газ** и система **септика**.\r\n\r\n**Состояние**\r\n\r\n* Выполнен качественный **ремонт**;\r\n* Предусмотрена готовая **мебель и техника** — можно въезжать сразу.\r\n\r\n**Локация**\r\n\r\n* СНТ «Родничок», станция Елизаветинская — экологически чистый, спокойный район, идеально подходит для комфортной жизни вдали от городского шума.\r\n\r\n**Цена**\r\n\r\n* **10 000 🍋** — эксклюзивное предложение по выгодной стоимости.\r\n\r\n---\r\n\r\n### Почему стоит присмотреться:\r\n\r\n* **Полноценный готовый дом** — нет нужды в дополнительных вложениях.\r\n* **Удобная инфраструктура**: рядом дорога, станции, магазины и зоны отдыха;\r\n* **Коммуникации подведены**, остаётся только заселиться.\r\n\r\n✨ Не упустите шанс — предложение ограничено! Готовы организовать показ в удобное время.\r\n\r\n📞 Свяжитесь с нами, чтобы узнать все подробности и договориться о просмотрах.\r\n	SALE	\N	\N	\N	\N	f	\N	a16b51bb-e859-42bd-bb86-98fd314fadd7	\N	Дом 161 м²	45.048431	38.799899	Россия, городской округ Краснодар, станица Елизаветинская	cmbtnkxrf0000jr040xylvgsh	dom-161-m
cmbywvor80001li04b06177j5	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Кореновская улица, 61	35	\N	11	18	Требуется ремонт	2010	t	4800000	₽	2025-06-16 09:48:11.925	К-1531	active	\N	🏢 Роскошная квартира с превосходным видом на две стороны света в престижном районе города!\r\n\r\nПредставляем вашему вниманию великолепную двухкомнатную квартиру, расположенную на 11 этаже современного жилого комплекса по адресу ул. Кореновская, 61. Это идеальное сочетание комфорта, престижа и продуманной инфраструктуры.\r\n\r\n✨ Основные характеристики:\r\n• Просторная квартира площадью 35 кв.м\r\n• 11 этаж – великолепный вид на город и отсутствие шума с нижних этажей\r\n• Качественная монолитно-кирпичная постройка 2010 года\r\n• Отличная шумоизоляция и комфортная температура в любое время года\r\n\r\n🏠 Интерьер и оснащение:\r\n• Требуется ремонт\r\n• Вся необходимая мебель остается новым владельцам\r\n• Сплит-система для идеального микроклимата\r\n• Металлическая входная дверь\r\n• Качественные пластиковые окна\r\n\r\n🏗 Развитая инфраструктура:\r\n• Детский сад и школа в непосредственной близости\r\n• Торговый центр всего в 100 метрах\r\n• Удобная парковка как во дворе, так и крытая парковка\r\n• Благоустроенный двор с детской площадкой\r\n\r\nЭта квартира – настоящий оазис комфорта и уюта в современном мегаполисе. Здесь продумана каждая деталь для вашего комфортного проживания. \r\n\r\nНе упустите возможность стать владельцем этой замечательной квартиры в одном из самых удобных для проживания районов города! 🔑	SALE	BALCONY	SEPARATE	MONOLITH_BRICK	\N	t	COURTYARD	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 35 м²	45.099371	38.984754	Россия, Краснодар, Кореновская улица, 61	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbyx61ju0001jl04yja2j1bd	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	ул. Войсковая 22/10	54	\N	2	7	Хорошее	\N	t	6400000	₽	2025-06-16 09:56:15.067	К-7634	active	\N	🏢 Просторная двухкомнатная квартира в развитом микрорайоне – ваш идеальный выбор для комфортной жизни!\r\n\r\nПредставляем вашему вниманию великолепную квартиру площадью 54 квадратных метра, расположенную на комфортном втором этаже по адресу ул. Войсковая, 22/10. Это идеальное сочетание простора, уюта и доступности всей необходимой инфраструктуры.\r\n\r\n✨ Основные преимущества:\r\n• Удачная планировка второго этажа – нет шума с первых этажей, при этом всегда легко добраться до лифта\r\n• Продуманная планировка квартиры с возможностью организации функциональных зон\r\n• Общая площадь позволяет комфортно разместиться как семье из 3-4 человек\r\n• Изолированные комнаты – возможность создать личное пространство для каждого члена семьи\r\n\r\n🏠 О квартире:\r\n• Светлая и просторная планировка\r\n• Качественные окна с видом на тихий двор\r\n• Раздельный санузел для максимального удобства\r\n• Надежные коммуникации\r\n• Качественная предчистовая отделка – возможность реализовать любые дизайнерские решения\r\n\r\n🌳 Развитая инфраструктура микрорайона:\r\n• В пешей доступности магазины, аптеки и кафе\r\n• Школы и детские сады рядом\r\n• Удобная транспортная развязка\r\n• Благоустроенный двор с детской площадкой\r\n\r\nЭта квартира станет вашим уютным гнездышком, где каждый найдет для себя место по душе. Здесь вы сможете создать комфортную атмосферу для жизни и отдыха всей семьи.\r\n\r\nНе упустите возможность стать владельцем этой замечательной квартиры! Записывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! 🔑\r\n\r\n	SALE	LOGGIA	SEPARATE	MONOLITH_BRICK	\N	t	COURTYARD	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 54 м²	\N	\N	\N	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbyxeas20009jl0477k63b9x	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Евгении Жигуленко, 7к2	24	\N	\N	\N	Хорошее	\N	t	4100000	₽	2025-06-16 10:02:40.274	К-1275	active	\N	🏢 Эксклюзивная квартира в престижном жилом комплексе комфорт-класса!\r\n\r\nПредставляем вашему вниманию великолепную квартиру, расположенную в одном из самых перспективных районов города – ЖК «Радуга», по адресу ул. Жигуленко, 7 корп. 2. Это не просто жилье – это ваш новый уровень комфортной жизни в современном доме!\r\n\r\n✨ Ключевые преимущества:\r\n• Современный монолитно-кирпичный дом с продуманной архитектурой\r\n• 21 этаж – великолепные видовые характеристики и отличная инсоляция\r\n• Просторные квартиры с продуманными планировками\r\n• Высота потолков 2,6 метра – создает ощущение простора\r\n\r\n🏠 О жилом комплексе:\r\n• Закрытая территория с видеонаблюдением\r\n• Подземный паркинг на 32 машиноместа\r\n• Современная система лифтов (пассажирский и грузовой)\r\n• Качественная предчистовая отделка – возможность реализовать любые дизайнерские решения\r\n• Развитая инфраструктура на территории комплекса\r\n\r\n🏗 Локация и инфраструктура:\r\n• Развитая транспортная доступность\r\n• В пешей доступности вся необходимая инфраструктура: магазины, школы, детские сады\r\n• Благоустроенный двор без машин\r\n• Зоны отдыха и детские площадки\r\n\r\nЭта квартира – идеальный вариант как для собственного проживания, так и для инвестиций. Здесь продумана каждая деталь для вашего комфортного проживания в современном жилом комплексе с безупречной репутацией.\r\n\r\nСтаньте владельцем квартиры в ЖК «Радуга» – выберите комфорт и престиж! Записывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! 🔑\r\n\r\n	SALE	BALCONY	COMBINED	MONOLITH_BRICK	\N	t	\N	6bec98df-22c4-4d2f-9c10-fc9a3fe3fe98	cmaianwry0000n9hb03zlv221	Студия 24 м²	45.096909	39.004841	Россия, Краснодар, улица Евгении Жигуленко, 7к2	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbzcbive0001jy04cor6y5vp	cma17xip50001n97czf8u3mhm	cma17p91m0000n94r28v2tbcr	городской округ Краснодар, посёлок Российский, улица Владимира Высоцкого, 26/1	98	\N	\N	2	Частичный ремонт	\N	t	8500000	₽	2025-06-16 17:00:25.034	Д-4800	active	\N	 Краснодарский край, Краснодар городской округ, пос. Российский, ул. Высоцкого, 26/1\r\n\r\nЦена: 7 900 000 рублей\r\n\r\nСтоимость за м²: 81 359 рублей\r\n\r\nХарактеристики дома:\r\n\r\nПлощадь дома: 97,1 м²\r\n\r\nЭтажность: 2 этажа\r\n\r\nМатериал стен: газоблоки с утеплителем\r\n\r\nФасад: белый кирпич\r\n\r\nОкна: металлопластиковые\r\n\r\nКрыша: металлочерепица\r\n\r\nПерекрытия: натяжные потолки\r\n\r\nТехнические характеристики:\r\n\r\nТип участка: ИЖС\r\n\r\nПлощадь участка: 2,5 сотки\r\n\r\nГод постройки: 2021\r\n\r\nКоммуникации:\r\n\r\nЭлектричество (15 кВт)\r\n\r\nСкважина глубиной 50 м\r\n\r\nСептик (10 куб.м)\r\n\r\nОтопление\r\n\r\nТёплые полы\r\n\r\nПарковка: есть место для автомобиля\r\n\r\nСостояние:\r\n\r\nПервый этаж: выполнен полный ремонт\r\n\r\nВторой этаж: частично выполнен ремонт\r\n\r\nИнфраструктура:\r\n\r\nРасположение: перспективный, развивающийся район\r\n\r\nВ шаговой доступности:\r\n\r\nМагазины\r\n\r\nОстановки общественного транспорта\r\n\r\nАптеки\r\n\r\nШколы\r\n\r\nДетские сады\r\n\r\nДокументы и сделка:\r\n\r\nПраво собственности: проверено\r\n\r\nСрок владения: от 3 до 5 лет\r\n\r\nКоличество собственников: 2\r\n\r\nВозможность ипотеки: доступна\r\n\r\nДом находится в хорошем состоянии, готов к проживанию на первом этаже, что делает его привлекательным вариантом как для постоянного проживания, так и для инвестиций.	SALE	\N	COMBINED	BRICK	\N	t	\N	a16b51bb-e859-42bd-bb86-98fd314fadd7	cmaianwry0000n9hb03zlv221	Дом 98 м²	45.119091	39.058425	Россия, городской округ Краснодар, посёлок Российский, улица Владимира Высоцкого, 26/1	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbzdcxe50001l104zymr6adk	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Домбайская улица, 55к5	56	\N	4	23	Хорошее	2023	t	6200000	₽	2025-06-16 17:29:30.125	К-1346	active	\N	Краснодар, Прикубанский округ, ул. Домбайская, 55/5\r\n\r\nТип объекта: 2-комнатная квартира\r\n\r\nЦена: 5 900 000 рублей\r\n\r\nПлощадь: 56 м²\r\n\r\nЭтаж: 4 из 24\r\n\r\nТип дома: кирпично-монолитный\r\n\r\nГод постройки: 2023\r\n\r\nПланировка и характеристики:\r\n\r\nРаздельные комнаты\r\n\r\nДизайнерский ремонт\r\n\r\nВысота потолков: 2.7 м\r\n\r\nПлощадь кухни: 11 м²\r\n\r\nНаличие: 2 лоджии\r\n\r\nДополнительно: теплый пол\r\n\r\nИнфраструктура района:\r\n\r\nМикрорайон: Губернский\r\n\r\nТранспортная доступность: остановка общественного транспорта в пешей доступности\r\n\r\nСоциальная инфраструктура:\r\n\r\nНовая школа\r\n\r\nДва детских сада\r\n\r\nДетская и взрослая поликлиники\r\n\r\nФитнес-центр\r\n\r\nТорговые объекты:\r\n\r\nСупермаркеты\r\n\r\nАптеки\r\n\r\nРазличные магазины\r\n\r\nДля детей:\r\n\r\nОборудованные детские площадки\r\n\r\nСпортивные площадки\r\n\r\nКоммуникации и удобства:\r\n\r\nКоличество лифтов: 3\r\n\r\nОбременения: отсутствуют\r\n\r\nВозможность ипотеки: доступна\r\n\r\nКвартира расположена в современном доме комфорт-класса с продуманной планировкой и качественным ремонтом. Отличное решение как для собственного проживания, так и для инвестиций. Развитая инфраструктура района обеспечивает все необходимое для комфортной жизни.	SALE	LOGGIA	\N	MONOLITH_BRICK	10.9	t	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 56 м²	45.070791	39.035734	Россия, Краснодар, Домбайская улица, 55к5	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbzdtyge0009l104st0ti06v	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Домбайская улица, 61	67	\N	11	24	Евроремонт	\N	f	7100000	₽	2025-06-16 17:42:44.655	К-3858	active	\N	Краснодар, Прикубанский округ, ул. Домбайская, 61\r\n\r\nТип объекта: 2-комнатная квартира\r\n\r\n\r\nЭтаж: 11 из 24\r\n\r\nГод постройки: 2018\r\n\r\nПланировка и площадь:\r\n\r\nОбщая площадь: 61,6 м²\r\n\r\nЖилая площадь: 30,3 м²\r\n\r\nПлощадь кухни: 12,7 м²\r\n\r\nСанузел: раздельный\r\n\r\nБалкон: есть\r\n\r\nРемонт: евроремонт\r\n\r\nХарактеристики дома:\r\n\r\nТип постройки: индивидуальный проект\r\n\r\nЛифты: 2 пассажирских + 1 грузовой\r\n\r\nПерекрытия: железобетонные\r\n\r\nПарковка: наземная\r\n\r\nОтопление: индивидуальный тепловой пункт\r\n\r\nИнфраструктура района:\r\n\r\nРазвитая территория:\r\n\r\nЗона отдыха с зеленым ландшафтом\r\n\r\nИгровые площадки с безопасным покрытием\r\n\r\nДетская площадка\r\n\r\nПарковка\r\n\r\nВ шаговой доступности:\r\n\r\nШколы и детские сады\r\n\r\nМагазины и супермаркеты\r\n\r\nТорговые центры\r\n\r\nКафе и рестораны\r\n\r\nФитнес-центр 50 GYM (100 м от дома)\r\n\r\nТранспортная доступность:\r\n\r\nУдобная дорожная развязка\r\n\r\nОстановки общественного транспорта\r\n\r\nДополнительные преимущества:\r\n\r\nИпотека: возможна \r\n\r\nТип сделки: свободная продажа\r\n\r\nОбременений: нет\r\n\r\nДокументы: готовы к сделке\r\n\r\nКвартира расположена в одном из самых развитых районов Краснодара, что делает её привлекательным вариантом как для собственного проживания, так и для инвестиций. Качественная инфраструктура и транспортная доступность создают все условия для комфортной жизни.	SALE	LOGGIA	\N	\N	12.7	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 67 м²	45.072433	39.03851	Россия, Краснодар, Домбайская улица, 61	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbywgaeo0001jp04i1bno336	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица Селезнёва, 126	43.9	\N	2	9	\N	1979	t	5700000	₽	2025-06-16 09:36:13.488	К-8875	active	\N	🏢 Уютная двухкомнатная квартира в тихом спальном районе города!\r\n\r\nПредставляем вашему вниманию настоящую находку для комфортного проживания – светлую и просторную квартиру площадью 43,9 квадратных метра. Идеальный вариант для семейного проживания в районе с прекрасно развитой инфраструктурой.\r\n\r\n✨ Главные преимущества:\r\n• Удачное расположение на 2 этаже – нет шума с первых этажей, при этом всегда легко добраться до лифта\r\n• Продуманная планировка квартиры\r\n• Общая площадь позволяет комфортно разместиться как семье из 3-4 человек\r\n• Изолированные комнаты – возможность организовать личное пространство для каждого члена семьи\r\n\r\n🏠 О квартире:\r\n• Свежий современный ремонт\r\n• Новые окна с видом на две стороны – естественное освещение в течение всего дня\r\n• Раздельный санузел – дополнительный комфорт для всей семьи\r\n• Качественные коммуникации\r\n• Надежная кирпичная постройка 1979 года – проверенная временем надежность\r\n\r\n🌳 Район отличается прекрасной транспортной доступностью и обилием зелёных зон. В пешей доступности торговый центр для повседневных нужд, а также школы и детские сады для ваших детей.\r\n\r\nЭта квартира – идеальный вариант как для собственного проживания, так и для инвестиций. Здесь вас ждёт комфорт и уют в сочетании с разумной стоимостью!\r\n\r\nЗаписывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! 🔑	SALE	\N	\N	\N	\N	t	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmbw8hd8z0009l504mmio8nwo	2-комнатная квартира 43.9 м²	\N	\N	\N	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0blkgu0001i404rwszqlt4	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Дубравная улица, 1	41.9	\N	18	19	Хорошее	\N	f	5300000	₽	2025-06-17 09:28:00.222	К-1873	active	\N	Продается шикарная квартира	SALE	\N	\N	MONOLITH_BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 41.9 м²	45.139732	38.986677	Россия, Краснодар, Дубравная улица, 1	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0e6ic60001l4041sbcd69g	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Защитников Отечества	44.3	\N	3	7	Хорошее	\N	f	5300000	₽	2025-06-17 10:40:16.47	К-5686	active	\N	Продается хорошая квартира	SALE	\N	SEPARATE	PANEL	13.9	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 44.3 м²	45.095821	39.010168	Россия, Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Защитников Отечества	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0dqsng0001jp045rk6eltj	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени 40-летия Победы, 178к4	23	\N	19	20	Ремонт от застройщика	\N	f	4350000	₽	2025-06-17 10:28:03.341	К-9621	active	\N	Продается хорошая квартира	SALE	\N	COMBINED	MONOLITH_BRICK	\N	f	\N	6bec98df-22c4-4d2f-9c10-fc9a3fe3fe98	cmaianwry0000n9hb03zlv221	Студия 23 м²	45.054658	39.03214	Россия, Краснодар, улица имени 40-летия Победы, 178к4	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1o2hje0009l704f42bxnyg	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Российская улица, 74	65	\N	12	18	Предчистовая	\N	f	7900000	₽	2025-06-18 08:04:51.146	К-5291	active	\N	Продается уютная однокомнатная квартира по адресу: ул. Им. Героя Яцкова, 19к2	SALE	BALCONY	\N	MONOLITH_BRICK	\N	f	\N	a359a2cd-42c3-4f24-83e0-1432618b988e	cmaianwry0000n9hb03zlv221	2-комнатная квартира 65 м²	45.053971	39.019789	Россия, Краснодар, Российская улица, 74	\N	\N
cmc1q5qc00001ld04c6fxrjdu	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, 2-я Российская улица, 162	84	\N	\N	\N	Предчистовая	\N	f	10500000	₽	2025-06-18 09:03:21.744	К-9597	active	\N	Продается 3-комнатная квартира	SALE	BALCONY	SEPARATE	MONOLITH_BRICK	14	f	\N	d4d608d6-f69a-4030-bd5b-1d73dc243be2	cmaianwry0000n9hb03zlv221	3-комнатная квартира 84 м²	45.082744	39.016366	Россия, Краснодар, 2-я Российская улица, 162	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1qtq990001l804uiwh34w8	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	городской округ Краснодар, посёлок Краснодарский, литД	33.4	\N	5	6	Предчистовая	\N	f	2600000	₽	2025-06-18 09:22:01.389	К-6739	active	\N	Продается 1 комнатная квартира	SALE	\N	COMBINED	BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 33.4 м²	45.084405	39.046702	Россия, городской округ Краснодар, посёлок Краснодарский, литД	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1pvslk0001lc048lnqmzi5	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Скандинавская улица, 1к1	34	\N	9	9	Хорошее	\N	f	4500000	₽	2025-06-18 08:55:38.12	К-6193	active	\N	Продается 1 комн квартира	SALE	BALCONY	COMBINED	MONOLITH_BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 34 м²	45.121355	38.93408	Россия, Краснодар, Скандинавская улица, 1к1	\N	\N
cmc1ozj15000jk304a6gmdppl	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица им. Героя Яцкова И.В., 19к3	38	\N	9	18	Хорошее	\N	t	5700000	₽	2025-06-18 08:30:32.729	К-3197	active	\N	Продается 1- комнатная квартира	SALE	BALCONY	COMBINED	MONOLITH_BRICK	\N	t	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 38 м²	45.070969	39.042588	Россия, Краснодар, улица им. Героя Яцкова И.В., 19к3	\N	\N
cmc1oubbt000hl704t4bk4k5p	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Боспорская улица, 12	70	\N	14	22	Предчистовая	\N	f	9250000	₽	2025-06-18 08:26:29.465	К-1821	active	\N	Продается 3-х комнатная квартира	SALE	BALCONY	SEPARATE	MONOLITH_BRICK	\N	f	COURTYARD	d4d608d6-f69a-4030-bd5b-1d73dc243be2	cmaianwry0000n9hb03zlv221	3-комнатная квартира 70 м²	45.077175	39.036641	Россия, Краснодар, Боспорская улица, 12	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1ojph20009k304e30nhtsq	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица имени Героя Николая Шевелёва, 2	36	\N	18	18	Хорошее	\N	f	6300000	₽	2025-06-18 08:18:14.582	К-3484	active	\N	Продается квартира	SALE	LOGGIA	COMBINED	MONOLITH_BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 36 м²	45.070848	39.039066	Россия, Краснодар, улица имени Героя Николая Шевелёва, 2	\N	\N
cmc1oel2n0009jj04z49g0x4h	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица им. Героя Яцкова И.В., 15к2	38	\N	13	18	Хорошее	\N	f	5100000	₽	2025-06-18 08:14:15.6	К-9314	active	\N	Продается 1 ком квартира	SALE	BALCONY	COMBINED	MONOLITH_BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 38 м²	45.070848	39.039066	Россия, Краснодар, улица им. Героя Яцкова И.В., 15к2	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc1nusum0001jj04gg4pocmb	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, улица им. Героя Яцкова И.В., 19к3	35	\N	15	20	Хорошее	2022	t	5700000	₽	2025-06-18 07:58:52.559	К-3655	active	\N	 Продается уютная однокомнатная квартира по адресу: ул. Им. Героя Яцкова, 19к2\r\n\r\nОбщая площадь: 35 кв.м\r\nЖилая площадь: 15 кв.м\r\nПлощадь кухни: 8,5 кв.м\r\n\r\nОписание квартиры:\r\n\r\nЭтаж: 15 из 20, что обеспечивает хорошую шумоизоляцию и отсутствие шума с улицы.\r\n\r\nСостояние: Квартира без ремонта, предчистовая отделка, что позволяет реализовать любые дизайнерские решения.\r\n\r\nИнфраструктура: Квартира расположена в одном из лучших районов города, в ЖК “Губернский”. Развитая инфраструктура включает три детских сада, школу, супермаркеты (Пятёрочка и Магнит), а также множество кафе и детских площадок.\r\n\r\nУдобства: На первых этажах расположены коммерческие помещения, что обеспечивает дополнительные удобства для жителей. Организована еженедельная фермерская торговля по субботам.\r\n\r\nДом: Дом построен в 2022 году застройщиком ЮСИ. Качественные материалы и надежная конструкция. В доме установлены железобетонные перекрытия, один пассажирский и один грузовой лифт.\r\n\r\nДополнительно: Квартира без обременений, документы готовы к сделке. Возможна ипотека.\r\n\r\nЭта квартира станет отличным выбором для тех, кто ценит комфорт и удобство современной городской жизни! Приглашаем на просмотр! 🔑\r\n\r\n	SALE	BALCONY	COMBINED	PANEL	8.5	t	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 35 м²	45.070969	39.042588	Россия, Краснодар, улица им. Героя Яцкова И.В., 19к3	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc0e0hns0001ie04xazcx1q5	cma17xo0z0003n97c87a2l7nj	cma17p91m0000n94r28v2tbcr	Краснодар, микрорайон Юбилейный, проспект Чекистов, 38	20	\N	0	\N	Хорошее	\N	f	2250000	₽	2025-06-17 10:35:35.657	К-2483	active	\N	Продается коммерция цоколь	SALE	\N	\N	PANEL	\N	f	\N	ef9ff24a-852f-4f53-a555-e190886aa646	cmal7i3r30000n9jb49irduyh	Офис 20 м²	45.031884	38.918917	Россия, Краснодар, микрорайон Юбилейный, проспект Чекистов, 38	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmbzfeu2m0001l404bz3gau95	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Краснодар, Восточно-Кругликовская улица, 28/3	38.4	\N	16	16	Хорошее	\N	f	5850000	₽	2025-06-16 18:26:58.366	К-9101	active	\N	 Краснодар, ул. Восточно-Кругликовская, 22/3\r\n\r\nТип объекта: 1-комнатная квартира\r\n\r\nПлощадь: 38,4 м²\r\n\r\nЭтаж: 16 из 16\r\n\r\nЦена: 5 850 000 рублей\r\n\r\n\r\n\r\nПланировка и характеристики:\r\n\r\nОбщая площадь: 38,4 м²\r\n\r\nЖилая площадь: 19 м²\r\n\r\nПлощадь кухни: 12 м²\r\n\r\nСанузел: совместный\r\n\r\n\r\n\r\n\r\n\r\nРемонт: хороший\r\n\r\nОсобенности квартиры:\r\n\r\nСовместный санузел с качественной отделкой\r\n\r\nЗастекленный балкон\r\n\r\nПластиковые окна\r\n\r\nНадёжная входная дверь\r\n\r\nСовременная система освещения\r\n\r\nКачественная отделка (ламинат, натяжные потолки)\r\n\r\nИнфраструктура и окружение:\r\n\r\nРазвитая инфраструктура района:\r\n\r\nШколы и детские сады в пешей доступности\r\n\r\nМагазины, супермаркеты и аптеки\r\n\r\nФитнес-центры и спортивные площадки\r\n\r\nЗоны отдыха и детские площадки\r\n\r\nТранспортная доступность:\r\n\r\nУдобная транспортная развязка\r\n\r\nЛегко добраться в любой район города\r\n\r\nДополнительные удобства:\r\n\r\nДомофон\r\n\r\nИнтернет и телефон\r\n\r\nКабельное телевидение\r\n\r\nСовременный ремонт\r\n\r\nКухонный гарнитур\r\n\r\nШкаф-купе\r\n\r\nКвартира находится в отличном состоянии и готова к заселению. Расположена в одном из престижных районов города с хорошо развитой инфраструктурой. Прекрасный вариант как для собственного проживания, так и для инвестиций.\r\n\r\n	SALE	LOGGIA	COMBINED	MONOLITH_BRICK	\N	f	\N	559c2a97-40b4-4fcc-80be-618c18f07f55	cmaianwry0000n9hb03zlv221	1-комнатная квартира 38.4 м²	45.04773	39.030847	Россия, Краснодар, Восточно-Кругликовская улица, 28/3	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
cmc3lcl3b0003n9qrb9ouwj99	cma17xhoj0000n97c1me6gvu7	cma17p91m0000n94r28v2tbcr	Ea fugiat veniam au	34	62	32	65	Черновая	1988	f	503	₽	2025-06-19 16:24:15.815	К-1432	active	Nisi autem enim dolo	Aliquip ut consequat	RENT	BOTH	COMBINED	BRICK	55	f	STREET	d4d608d6-f69a-4030-bd5b-1d73dc243be2	cmbw8gjn30008l5046qgvlagl	3-комнатная квартира 34 м²	\N	\N	\N	78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74	\N
\.


--
-- TOC entry 3775 (class 0 OID 26783)
-- Dependencies: 215
-- Data for Name: ListingHistory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ListingHistory" (id, "listingId", "userId", changes, "createdAt", action) FROM stdin;
cmbwiscg20003jm04zjkfo4zw	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-14 17:38:09.026	update
cmbt6qom20003jv044jtoquod	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 8, "price": 5300000, "title": "2-комнатная квартира 54.3 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени 40-летия Победы, 101", "dealType": "SALE", "latitude": 45.058816, "noShares": false, "houseArea": 54.3, "longitude": 39.02967, "categoryId": "cma17xhoj0000n97c1me6gvu7", "fullAddress": "Россия, Краснодар, улица имени 40-летия Победы, 101", "kitchenArea": 11, "listingCode": "К-9378", "totalFloors": 16, "adminComment": "Наш ЭКС", "noEncumbrances": false, "publicDescription": "**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!\\r\\n\\r\\n[Здесь можно добавить информацию о площади квартиры, этаже, состоянии ремонта и другие важные детали, если они известны]"}, "action": "create"}	2025-06-12 09:37:37.562	create
cmbt6snz90003l804sk06x353	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/1f3a4e6f-7aac-414c-a7a8-7d725a8d5afa.jpg", "size": "2874KB", "filename": "20250504_121050.jpg"}]}	2025-06-12 09:39:10.053	images
cmbt6sp040005l804t87yh7lh	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 09:39:11.38	update
cmbt6svgi0007l804nv0ddgje	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"deleted": [{"id": "cmbt6qowv0005jv045j9ztl98", "path": "/images/apartments_placeholder.png", "isFeatured": true}]}	2025-06-12 09:39:19.746	images
cmbt6sw9l0009l804yplgui6e	cmbt6qogb0001jv04651cnmyz	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 09:39:20.793	update
cmbtl4l5n000vn919ftc107l3	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/859cde9f-1c06-4f8b-96f1-75ebfe6f1889.jpg", "size": "200KB", "filename": "20250504_121050.jpg"}]}	2025-06-12 16:20:20.891	images
cmbtl4mua000xn919433z8nb1	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:20:23.074	update
cmbzdczc20007l104ex2dcwns	cmbzdcxe50001l104zymr6adk	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/2800e1d1-fc74-42e2-95a0-d5fe7645c130.jpg", "size": "224KB", "filename": "Изображение WhatsApp 2025-05-30 в 20.01.46_fde60c18.jpg"}]}	2025-06-16 17:29:32.643	images
cmc1ojr45000fk30412wg6d11	cmc1ojph20009k304e30nhtsq	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/f3ca0f08-58e7-4681-8054-85bdf5e9b5c4.jpg", "size": "216KB", "filename": "Изображение WhatsApp 2025-06-06 в 18.26.45_3fe3dc0a.jpg"}]}	2025-06-18 08:18:16.709	images
cmc1on4mb000hk3042e2l8laa	cmc1ojph20009k304e30nhtsq	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени Героя Николая Шевелёва, 5", "old": "Краснодар, улица им. Героя Яцкова И.В., 15к1"}, "fullAddress": {"new": "Россия, Краснодар, улица имени Героя Николая Шевелёва, 5", "old": "Россия, Краснодар, улица им. Героя Яцкова И.В., 15к1"}}}	2025-06-18 08:20:54.179	update
cmc1pvsqt0003lc04rfqkdxhf	cmc1pvslk0001lc048lnqmzi5	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 9, "price": 4500000, "title": "1-комнатная квартира 34 м²", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Скандинавская улица, 1", "dealType": "SALE", "latitude": 45.121355, "noShares": false, "condition": "Хорошее", "houseArea": 34, "longitude": 38.93408, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, Скандинавская улица, 1", "listingCode": "К-6193", "totalFloors": 9, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 1 комн квартира"}, "action": "create"}	2025-06-18 08:55:38.31	create
cmc1pvubu0007lc04g89gf2tv	cmc1pvslk0001lc048lnqmzi5	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/5deac965-620f-4118-8072-0c896327e610.jpg", "size": "191KB", "filename": "Изображение WhatsApp 2025-05-31 в 15.43.10_094514ca.jpg"}]}	2025-06-18 08:55:40.363	images
cmc1q5qh50003ld040spa85fj	cmc1q5qc00001ld04c6fxrjdu	cmah4r0390000n98ec1sazzvm	{"data": {"price": 10500000, "title": "3-комнатная квартира 84 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "d4d608d6-f69a-4030-bd5b-1d73dc243be2", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, 2-я Российская улица, 162", "dealType": "SALE", "latitude": 45.082744, "noShares": false, "condition": "Предчистовая", "houseArea": 84, "longitude": 39.016366, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, 2-я Российская улица, 162", "kitchenArea": 14, "listingCode": "К-9597", "bathroomType": "SEPARATE", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 3-комнатная квартира"}, "action": "create"}	2025-06-18 09:03:21.929	create
cmc1q5s7m0007ld04onga477m	cmc1q5qc00001ld04c6fxrjdu	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/1ebe0092-81a6-4cb8-a370-3a045abbff6d.jpg", "size": "396KB", "filename": "Изображение WhatsApp 2025-05-31 в 16.12.54_60986d8e.jpg"}]}	2025-06-18 09:03:24.178	images
cmbti7zwi0001n980q5ft9z2w	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"publicDescription": {"new": "[](https://)**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!", "old": "**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!\\r\\n\\r\\n[Здесь можно добавить информацию о площади квартиры, этаже, состоянии ремонта и другие важные детали, если они известны]"}}}	2025-06-12 14:59:01.119	update
cmbtib9hd0005n980bsjfde6y	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg", "size": "3508KB", "filename": "20250504_120028.jpg"}]}	2025-06-12 15:01:33.505	images
cmbtibc4e0007n980vlc6pfi7	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 15:01:36.926	update
cmbtj3rj10003n9g7j35q5ar6	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg", "size": "2780KB", "filename": "20250504_120049.jpg"}]}	2025-06-12 15:23:43.261	images
cmbtj3sls0005n9g7ffbmhdpl	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"publicDescription": {"new": "**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!", "old": "[](https://)**Просторная двухкомнатная квартира** по адресу ул. 40-летия Победы, 101 ждет своих новых хозяев!\\r\\n\\r\\n**Комфортная планировка** включает две изолированные комнаты, что идеально подойдет как для семьи с детьми, так и для пары, желающей иметь личное пространство.\\r\\n\\r\\n**Функциональная кухня** оборудована всем необходимым для комфортного приготовления пищи. Продуманная планировка позволяет удобно разместить всю необходимую бытовую технику.\\r\\n\\r\\n**Раздельный санузел** – практичное решение для всей семьи, обеспечивающее удобство использования в любое время суток.\\r\\n\\r\\n**Удобный коридор** грамотно организует пространство и обеспечивает легкий доступ ко всем помещениям квартиры.\\r\\n\\r\\n**Развитая инфраструктура** района делает проживание максимально комфортным: в пешей доступности находятся магазины, школы, детские сады и остановки общественного транспорта.\\r\\n\\r\\nКвартира готова к заселению – заезжайте и живите! Не упустите возможность стать владельцем этого уютного жилья в хорошем районе города.\\r\\n\\r\\n**Звоните прямо сейчас** – организуем просмотр в удобное для вас время!"}}}	2025-06-12 15:23:44.657	update
cmbtk2e1h0003n919qx81lfrr	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/e96986e7-7ea4-4438-9dc4-988baae54e88.jpg", "size": "3155KB", "filename": "20250504_120130.jpg"}]}	2025-06-12 15:50:38.741	images
cmbtk2fwg0005n919qk8w90gh	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 15:50:41.153	update
cmbtkaa7p0009n919dww00hrd	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/9703dcc3-183f-48b4-9c17-4fc38754cb65.jpg", "size": "2964KB", "filename": "20250504_120156.jpg"}]}	2025-06-12 15:56:47.029	images
cmbtkabzk000bn919lzjdd8b3	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 15:56:49.328	update
cmbtkhae1000fn919ovuuducy	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/dc89636e-0d81-48c1-bc16-bfde11c20676.jpg", "size": "238KB", "filename": "20250504_120454.jpg"}]}	2025-06-12 16:02:13.85	images
cmbtkhc3f000hn919u6ha6hcb	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:02:16.059	update
cmbtkjo42000ln919kwsbbult	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/47a596ab-7417-4fa3-b11a-11d40a68778d.jpg", "size": "241KB", "filename": "20250504_120248.jpg"}]}	2025-06-12 16:04:04.946	images
cmbtkjpx6000nn9199y45cklg	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:04:07.291	update
cmbtkkr44000pn9198e55lwcf	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "/uploads/listings/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg", "previous": "unknown", "previousPath": "/uploads/listings/1f3a4e6f-7aac-414c-a7a8-7d725a8d5afa.jpg"}}	2025-06-12 16:04:55.492	images
cmbtkks3x000rn919dsk8mbxj	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:04:56.781	update
cmbtlbb340009n9igql2ltitk	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/65115e66-5ffe-418a-ac35-e3b2893a0509.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "/uploads/listings/641cc412-d2de-459d-af6f-5e389ef57958.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "/uploads/listings/4e7fd17f-e5ef-46f2-af9b-4b98b701b6c2.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "/uploads/listings/dadb8915-83e4-4d21-a57d-30dd10263420.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}]}	2025-06-12 16:25:34.432	images
cmbtlbcs6000bn9ig2iuh8x6h	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:25:36.63	update
cmbtlit4v0001jo04i23251xr	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "/uploads/listings/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg", "previous": "unknown", "previousPath": "/uploads/listings/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg"}}	2025-06-12 16:31:24.415	images
cmbtliu2r0003jo0470tw8gok	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:31:25.635	update
cmbtljps60005jo04x1trmwo3	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "/uploads/listings/6cbb2cb2-5952-4f0b-a6f8-19b9d9f3bce7.jpg", "previous": "unknown", "previousPath": "/uploads/listings/b58cfa80-9f59-4c6b-ae45-e30ae2800c38.jpg"}}	2025-06-12 16:32:06.726	images
cmbtljqpz0007jo04es1tm21z	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:32:07.944	update
cmbtm2cji000jn9igo5m0foqe	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/f0b34b18-367a-4ff3-8331-da74499c38d8.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "/uploads/listings/d1079c4e-75ae-4a26-94ea-f005cb2d5351.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}, {"path": "/uploads/listings/4a6981da-8931-4dbb-9010-036ddb8da978.jpg", "size": "213KB", "filename": "20250504_121201.jpg"}]}	2025-06-12 16:46:36.03	images
cmbtm2e92000ln9igryfbn2r2	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:46:38.246	update
cmbtm364z000nn9igzpd1u1pt	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"deleted": [{"id": "cmbtl4ksz000tn919g3xh0mxw", "path": "/uploads/listings/859cde9f-1c06-4f8b-96f1-75ebfe6f1889.jpg", "isFeatured": false}, {"id": "cmbtm2c6f000fn9igrsonwi9h", "path": "/uploads/listings/d1079c4e-75ae-4a26-94ea-f005cb2d5351.jpg", "isFeatured": false}, {"id": "cmbtm2cai000hn9ig1te78liw", "path": "/uploads/listings/4a6981da-8931-4dbb-9010-036ddb8da978.jpg", "isFeatured": false}]}	2025-06-12 16:47:14.387	images
cmbtm3bks000pn9igpm1pf1dk	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:47:21.436	update
cmbtm6lo2000rn9igownb9a4n	cmbt6qogb0001jv04651cnmyz	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-12 16:49:54.482	update
cmbtny39s0003lb04pt5cuads	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"data": {"price": 10000000, "title": "Дача 161 м²", "cityId": "cmbtnkxrf0000jr040xylvgsh", "status": "active", "typeId": "9a2bc74e-2608-4e52-b948-da97c87c6446", "userId": "cma17p91m0000n94r28v2tbcr", "address": "городской округ Краснодар, станица Елизаветинская", "dealType": "SALE", "landArea": 7, "latitude": 45.048431, "noShares": false, "houseArea": 161, "longitude": 38.799899, "categoryId": "cma17xip50001n97czf8u3mhm", "fullAddress": "Россия, городской округ Краснодар, станица Елизаветинская", "listingCode": "Д-8500", "noEncumbrances": false, "publicDescription": "🏰 РОСКОШНЫЙ ДОМ В ПРЕСТИЖНОМ САДОВОМ ТОВАРИЩЕСТВЕ \\"РОДНИЧОК\\"\\r\\n\\r\\nПредставляем вашему вниманию великолепный дом, который станет вашим уютным гнездышком в живописном районе станицы Елизаветинская!\\r\\n\\r\\n✨ ГЛАВНЫЕ ПРЕИМУЩЕСТВА:\\r\\n• Просторный дом площадью 161 м²\\r\\n• Уютный участок 7 соток\\r\\n• Полностью готов к заселению!\\r\\n\\r\\n🏠 ГОТОВАЯ ИНФРАСТРУКТУРА:\\r\\n• Выполнен качественный ремонт\\r\\n• Вся необходимая мебель включена в стоимость\\r\\n• Современная бытовая техника\\r\\n• Все коммуникации заведены и готовы к использованию:\\r\\n  - Скважина для водоснабжения\\r\\n  - Надежный септик\\r\\n  - Газоснабжение (газовые коммуникации уже подведены)\\r\\n\\r\\n🏡 ОСОБЕННОСТИ УЧАСТКА:\\r\\n• Продуманная планировка территории\\r\\n• Возможность обустройства сада и зоны отдыха\\r\\n• Достаточно места для парковки и хозяйственных построек\\r\\n\\r\\n📍 ПРЕВОСХОДНАЯ ЛОКАЦИЯ:\\r\\n• Развитая инфраструктура станицы\\r\\n• В шаговой доступности магазины, школы и детские сады\\r\\n• Удобная транспортная доступность\\r\\n• Живописный берег реки Кубань в непосредственной близости\\r\\n\\r\\nЭтот дом – идеальное решение для тех, кто ценит комфорт и хочет жить в экологически чистом районе с прекрасной природой и всеми благами современной цивилизации!\\r\\n\\r\\nНе упустите возможность стать владельцем этого замечательного дома! Записывайтесь на просмотр прямо сейчас!\\r\\n\\r\\n📞 Свяжитесь с нами для получения подробной информации и организации просмотра!"}, "action": "create"}	2025-06-12 17:39:16.624	create
cmbtnylix0007lb0424z0dgw4	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"deleted": [{"id": "cmbtny3kz0005lb04x7y4gwwj", "path": "/images/houses_placeholder.png", "isFeatured": true}]}	2025-06-12 17:39:40.282	images
cmbtnyn28000blb04maenweqw	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg", "size": "193KB", "filename": "IMG-20250519-WA0219(1).jpg"}]}	2025-06-12 17:39:42.273	images
cmbtnynuq000dlb04s5prf3th	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 17:39:43.299	update
cmbtnyvgc000flb04apey28te	cmbtny34g0001lb04v5ccsltp	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {}}	2025-06-12 17:39:53.149	update
cmbw8bgc60003l504ywq4fult	cmbw8bg6w0001l504grutg3o6	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 16, "price": 8200000, "title": "3-комнатная квартира 79.1 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "d4d608d6-f69a-4030-bd5b-1d73dc243be2", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Петра Метальникова, 40", "dealType": "SALE", "latitude": 45.097876, "noShares": true, "condition": "Предчистовая", "houseArea": 79.1, "longitude": 39.001292, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Петра Метальникова, 40", "listingCode": "К-1299", "totalFloors": 21, "windowsView": "COURTYARD", "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "🏢 ПРЕМИАЛЬНАЯ ТРЕХКОМНАТНАЯ КВАРТИРА В ЖИЛОМ КОМПЛЕКСЕ «ЛУЧШИЙ»\\r\\n\\r\\nПредставляем вашему вниманию великолепную трехкомнатную квартиру, расположенную в современном жилом комплексе комфорт+ класса!\\r\\n\\r\\n✨ ОСНОВНЫЕ ХАРАКТЕРИСТИКИ:\\r\\n• Общая площадь: 79,1 м²\\r\\n• Жилая площадь: продуманная планировка\\r\\n• Просторная кухня: 15 м²\\r\\n• 18 этаж из 24\\r\\n• Окна с великолепным видом на город\\r\\n\\r\\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\\r\\n• Надежный застройщик ССК\\r\\n• Дом сдан и активно заселяется\\r\\n• Закрытая территория с видеонаблюдением\\r\\n• Благоустроенный двор без машин\\r\\n• Детская площадка для комфортного отдыха\\r\\n• Наземная и гостевая парковка\\r\\n• Пассажирский и грузовой лифты\\r\\n\\r\\n📍 ЛОКАЦИЯ И ИНФРАСТРУКТУРА:\\r\\n• Развитая инфраструктура района\\r\\n• Школы и детские сады в шаговой доступности\\r\\n• Магазины Табрис и Пятёрочка рядом\\r\\n• Сбербанк, Ozon, Wildberries – всё под рукой\\r\\n• Удобная транспортная развязка, включая трамвайную линию\\r\\n\\r\\n🛋 ДОПОЛНИТЕЛЬНЫЕ ПРЕИМУЩЕСТВА:\\r\\n• Раздельный санузел\\r\\n• Качественные пластиковые окна\\r\\n• Индивидуальное отопление\\r\\n• Установлены счётчики на воду\\r\\n• Домофон и железная дверь\\r\\n• Улучшенная черновая отделка\\r\\n• Возможность реализации любых дизайнерских решений\\r\\n\\r\\nЭта квартира – идеальный выбор для комфортной жизни всей семьи! Продуманная планировка, два просторных балкона и великолепный вид на город делают её уникальной.\\r\\n\\r\\nНе упустите шанс стать владельцем этой замечательной квартиры! Записывайтесь на просмотр в любое удобное время.\\r\\n\\r\\n📞 Звоните прямо сейчас, чтобы узнать все подробности и договориться о встрече!"}, "action": "create"}	2025-06-14 12:45:04.759	create
cmbw8bi7i0007l5041bh1bfbt	cmbw8bg6w0001l504grutg3o6	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/321ad43d-75ed-4761-a239-54481e05e9bb.jpg", "size": "208KB", "filename": "Изображение WhatsApp 2025-05-30 в 20.16.55_542b7465.jpg"}]}	2025-06-14 12:45:07.182	images
cmc0dquik0007jp04xlk6veit	cmc0dqsng0001jp045rk6eltj	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/f2ffd6bf-66c8-44e5-947e-b4b26ffbfe35.jpg", "size": "234KB", "filename": "Изображение WhatsApp 2025-05-30 в 21.46.33_df8a85c2.jpg"}]}	2025-06-17 10:28:05.757	images
cmc1z6cjg0005ky04im8w08l1	cmc1o2hje0009l704f42bxnyg	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Российская улица, 74", "old": "Краснодар, Российская улица, 72/6"}, "fullAddress": {"new": "Россия, Краснодар, Российская улица, 74", "old": "Россия, Краснодар, Российская улица, 72/6"}}}	2025-06-18 13:15:47.069	update
cmbtn88it0003la04wh494i62	cmbtn88dl0001la040vdj2wwv	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 7, "price": 6750000, "title": "2-комнатная квартира 71 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Цезаря Куникова, 24к1", "dealType": "SALE", "latitude": 45.099308, "noShares": true, "condition": "Требуется ремонт", "houseArea": 71, "longitude": 39.001409, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, улица Цезаря Куникова, 24к1", "kitchenArea": 10, "listingCode": "К-5679", "totalFloors": 16, "windowsView": "COURTYARD", "bathroomType": "COMBINED", "buildingType": "MONOLITH", "noEncumbrances": true, "publicDescription": "🏢 Просторная квартира в престижном районе Метальникова\\r\\n\\r\\nПредставляем вашему вниманию великолепную квартиру, расположенную в одном из самых комфортных районов города! \\r\\n\\r\\n✨ Основные характеристики:\\r\\n• Общая площадь: 71 м²\\r\\n• Этаж: 7 из 16 (идеальный вариант без шума сверху и снизу)\\r\\n• Функциональная планировка Евро-формата\\r\\n• Светлая и просторная гостиная 20 м² с выходом на уютную лоджию (10 м²)\\r\\n\\r\\n🏠 Особый комфорт:\\r\\n• Продуманная планировка\\r\\n• Продуманное расположение окон\\r\\n• Возможность организовать зону отдыха с выходом на лоджию\\r\\n• Функциональная кухня-гостиная\\r\\n\\r\\n🏗 Развитая инфраструктура района:\\r\\n• В пешей доступности магазины, школы и детские сады\\r\\n• Удобная транспортная развязка\\r\\n• Благоустроенный двор\\r\\n• Парковочные места\\r\\n\\r\\nЭта квартира станет вашим идеальным гнездышком для комфортной жизни в одном из самых перспективных районов города! \\r\\n\\r\\nЗаписывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! \\r\\n\\r\\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!"}, "action": "create"}	2025-06-12 17:19:10.373	create
cmbtn8anr0007la04j7tpohnk	cmbtn88dl0001la040vdj2wwv	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/cbb912e2-9a8e-4496-a19c-92a0868abcb0.jpg", "size": "568KB", "filename": "20250517_115514.jpg"}]}	2025-06-12 17:19:13.143	images
cmbuhm0nq0001n9ts9o2vp3gn	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"title": {"new": "Дом 161 м²", "old": "Дача 161 м²"}, "typeId": {"new": "a16b51bb-e859-42bd-bb86-98fd314fadd7", "old": "9a2bc74e-2608-4e52-b948-da97c87c6446"}}}	2025-06-13 07:29:41.843	update
cmbv03bjm000hn9tsi8hss8jq	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/7822c662-a0f5-4dc0-a92f-d9c55cf0b66a.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "/uploads/listings/118e2fea-513d-4dfb-8a51-51ca51f97fe4.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "/uploads/listings/de99f342-a146-4887-a817-63be32448576.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "/uploads/listings/8c69ff13-995b-4cbb-a7cb-06dfb2c62aba.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "/uploads/listings/12326a9b-d2d2-410b-a913-197a84a70a86.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "/uploads/listings/ebcfe7cd-deb3-4822-afc5-4b59af32b776.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}, {"path": "/uploads/listings/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg", "size": "77KB", "filename": "IMG-20250517-WA0198.jpg"}]}	2025-06-13 16:07:02.195	images
cmbv03dow000jn9tsb3wv7bfn	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"publicDescription": {"new": "Элитное предложение в СНТ «Родничок», ст. Елизаветинская — ваш идеальный загородный дом!\\r\\n\\r\\n---\\r\\n\\r\\n### 🏡 Основные характеристики:\\r\\n\\r\\n**Площадь**\\r\\n\\r\\n* Дом – **161 м²**, на участке **7 соток** земли.\\r\\n\\r\\n**Инженерные коммуникации**\\r\\n\\r\\n* Своя **скважина с питьевой водой**;\\r\\n* Подведены **газ** и система **септика**.\\r\\n\\r\\n**Состояние**\\r\\n\\r\\n* Выполнен качественный **ремонт**;\\r\\n* Предусмотрена готовая **мебель и техника** — можно въезжать сразу.\\r\\n\\r\\n**Локация**\\r\\n\\r\\n* СНТ «Родничок», станция Елизаветинская — экологически чистый, спокойный район, идеально подходит для комфортной жизни вдали от городского шума.\\r\\n\\r\\n**Цена**\\r\\n\\r\\n* **10 000 🍋** — эксклюзивное предложение по выгодной стоимости.\\r\\n\\r\\n---\\r\\n\\r\\n### Почему стоит присмотреться:\\r\\n\\r\\n* **Полноценный готовый дом** — нет нужды в дополнительных вложениях.\\r\\n* **Удобная инфраструктура**: рядом дорога, станции, магазины и зоны отдыха;\\r\\n* **Коммуникации подведены**, остаётся только заселиться.\\r\\n\\r\\n✨ Не упустите шанс — предложение ограничено! Готовы организовать показ в удобное время.\\r\\n\\r\\n📞 Свяжитесь с нами, чтобы узнать все подробности и договориться о просмотрах.\\r\\n", "old": "🏰 РОСКОШНЫЙ ДОМ В ПРЕСТИЖНОМ САДОВОМ ТОВАРИЩЕСТВЕ \\"РОДНИЧОК\\"\\r\\n\\r\\nПредставляем вашему вниманию великолепный дом, который станет вашим уютным гнездышком в живописном районе станицы Елизаветинская!\\r\\n\\r\\n✨ ГЛАВНЫЕ ПРЕИМУЩЕСТВА:\\r\\n• Просторный дом площадью 161 м²\\r\\n• Уютный участок 7 соток\\r\\n• Полностью готов к заселению!\\r\\n\\r\\n🏠 ГОТОВАЯ ИНФРАСТРУКТУРА:\\r\\n• Выполнен качественный ремонт\\r\\n• Вся необходимая мебель включена в стоимость\\r\\n• Современная бытовая техника\\r\\n• Все коммуникации заведены и готовы к использованию:\\r\\n  - Скважина для водоснабжения\\r\\n  - Надежный септик\\r\\n  - Газоснабжение (газовые коммуникации уже подведены)\\r\\n\\r\\n🏡 ОСОБЕННОСТИ УЧАСТКА:\\r\\n• Продуманная планировка территории\\r\\n• Возможность обустройства сада и зоны отдыха\\r\\n• Достаточно места для парковки и хозяйственных построек\\r\\n\\r\\n📍 ПРЕВОСХОДНАЯ ЛОКАЦИЯ:\\r\\n• Развитая инфраструктура станицы\\r\\n• В шаговой доступности магазины, школы и детские сады\\r\\n• Удобная транспортная доступность\\r\\n• Живописный берег реки Кубань в непосредственной близости\\r\\n\\r\\nЭтот дом – идеальное решение для тех, кто ценит комфорт и хочет жить в экологически чистом районе с прекрасной природой и всеми благами современной цивилизации!\\r\\n\\r\\nНе упустите возможность стать владельцем этого замечательного дома! Записывайтесь на просмотр прямо сейчас!\\r\\n\\r\\n📞 Свяжитесь с нами для получения подробной информации и организации просмотра!"}}}	2025-06-13 16:07:04.977	update
cmbv03obk000ln9ts8hdt5cvf	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "/uploads/listings/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg", "previous": "unknown", "previousPath": "/uploads/listings/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg"}}	2025-06-13 16:07:18.752	images
cmbv03pk3000nn9tskvnz7ia3	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-13 16:07:20.355	update
cmbv047s9000pn9tsu5mm3uqe	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "/uploads/listings/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg", "previous": "unknown", "previousPath": "/uploads/listings/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg"}}	2025-06-13 16:07:43.978	images
cmbv049xm000rn9tswnw9spwo	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-13 16:07:46.762	update
cmbw6lg3m0003ih04rhrxvchj	cmbw6lfyb0001ih04jh7j8yo8	cmah4r0390000n98ec1sazzvm	{"data": {"price": 12800000, "title": "3-комнатная квартира", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "d4d608d6-f69a-4030-bd5b-1d73dc243be2", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Героев-Разведчиков, 48", "dealType": "SALE", "latitude": 45.068792, "noShares": true, "condition": "Хорошее", "longitude": 39.033605, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, улица Героев-Разведчиков, 48", "listingCode": "К-6008", "windowsView": "COURTYARD", "bathroomType": "SEPARATE", "buildingType": "PANEL", "noEncumbrances": true, "publicDescription": "🏢 РОСКОШНАЯ ДВУХКОМНАТНАЯ КВАРТИРА В ПРЕСТИЖНОМ РАЙОНЕ\\r\\n\\r\\nПредставляем вашему вниманию великолепную двухкомнатную квартиру, расположенную в одном из самых комфортных для проживания районов города!\\r\\n\\r\\n✨ О КВАРТИРЕ:\\r\\n• Продуманная планировка\\r\\n• Светлая и просторная кухня с выходом на лоджию\\r\\n• Уютная прихожая большого размера\\r\\n• Две светлые и комфортные комнаты\\r\\n• Раздельный санузел с современной сантехникой\\r\\n• Выполнен качественный косметический ремонт\\r\\n\\r\\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\\r\\n• Закрытая территория с ограниченным доступом\\r\\n• Вход по электронному ключу или домофону\\r\\n• Благоустроенный двор с современными детскими площадками\\r\\n• Зелёная зона для спокойных прогулок\\r\\n• Оборудованная площадка для выгула домашних питомцев\\r\\n• Доброжелательные соседи\\r\\n\\r\\n📍 ПРЕИМУЩЕСТВА РАСПОЛОЖЕНИЯ:\\r\\n• Развитая инфраструктура: магазины, школы, детские сады, поликлиника – всё в шаговой доступности\\r\\n• В самом доме: продуктовые магазины, аптеки, пекарни, салоны красоты\\r\\n• Отличная транспортная доступность – остановки общественного транспорта рядом\\r\\n• Уединённое расположение вдали от проезжей части\\r\\n\\r\\nЭта квартира создана для комфортной жизни! Здесь каждый найдёт своё идеальное пространство: от просторной кухни до уютных спален.\\r\\n\\r\\nНе упустите возможность стать владельцем этой замечательной квартиры! Запишитесь на просмотр прямо сейчас и откройте для себя новый уровень комфортной жизни в одном из лучших районов города!\\r\\n\\r\\n📞 Звоните, чтобы узнать все подробности и договориться о просмотре!"}, "action": "create"}	2025-06-14 11:56:51.778	create
cmbw6li2w0007ih043lr8g39z	cmbw6lfyb0001ih04jh7j8yo8	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/32d3bb8e-79c2-4662-b5bb-197e90e45c8d.jpg", "size": "209KB", "filename": "Изображение WhatsApp 2025-06-02 в 21.28.33_60cdb835.jpg"}]}	2025-06-14 11:56:54.344	images
cmbw79x6v0001n9shqyztnsmi	cmbw6lfyb0001ih04jh7j8yo8	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-14 12:15:53.669	update
cmbw7p4bj0003ky04q3abvjjw	cmbw7p4620001ky04qjh8u4x4	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 1, "price": 3300000, "title": "1-комнатная квартира", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Республика Адыгея (Адыгея), Тахтамукайский район, Старобжегокайское сельское поселение, аул Новая Адыгея, Бжегокайская улица, 90/5к2", "dealType": "SALE", "latitude": 45.01569, "noShares": true, "condition": "Предчистовая", "longitude": 38.91111, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmal7i3r30000n9jb49irduyh", "fullAddress": "Россия, Республика Адыгея (Адыгея), Тахтамукайский район, Старобжегокайское сельское поселение, аул Новая Адыгея, Бжегокайская улица, 90/5к2", "kitchenArea": 10.5, "listingCode": "К-6443", "totalFloors": 5, "bathroomType": "COMBINED", "buildingType": "BRICK", "noEncumbrances": true, "publicDescription": "🏢 ПРОСТОРНАЯ ОДНОКОМНАТНАЯ КВАРТИРА В ЖИЛОМ КОМПЛЕКСЕ “МЕГА”\\r\\n\\r\\nПредлагается на продажу уютная однокомнатная квартира, расположенная в современном жилом комплексе комфорт-класса!\\r\\n\\r\\n✨ ХАРАКТЕРИСТИКИ КВАРТИРЫ:\\r\\n• Общая площадь: 39,8 м²\\r\\n• Жилая площадь: 15,3 м²\\r\\n• Площадь кухни: 10,5 м²\\r\\n• 1 этаж из 5\\r\\n• Без ремонта – идеально для реализации ваших дизайнерских идей!\\r\\n• Совмещенный санузел\\r\\n• Утепленный балкон с видом на улицу\\r\\n\\r\\n🏠 О ДОМЕ И ТЕРРИТОРИИ:\\r\\n• Современный жилой комплекс с благоустроенной территорией\\r\\n• Наземная парковка для жильцов\\r\\n• Подъезд с качественным ремонтом\\r\\n• Грузовой и пассажирский лифты\\r\\n• Круглосуточная охрана и видеонаблюдение\\r\\n\\r\\n📍 ЛОКАЦИЯ:\\r\\n• Тахтамукайский район, аул Новая Адыгея\\r\\n• Развитая инфраструктура: магазины, школы, детские сады в шаговой доступности\\r\\n• Удобная транспортная развязка\\r\\n\\r\\n\\r\\n📈 УСЛОВИЯ ПРОДАЖИ:\\r\\n• Свободная продажа\\r\\n• Возможность оформления ипотеки\\r\\n• Один собственник\\r\\n• Быстрый выход на сделку\\r\\n• Помощь в одобрении ипотеки \\r\\n\\r\\nЭта квартира станет отличным выбором как для собственного проживания, так и для инвестиций. Просторная планировка и удачное расположение делают её привлекательной для молодых семей и тех, кто ценит комфорт и удобство!\\r\\n\\r\\nНе упустите шанс стать владельцем этой замечательной квартиры! Записывайтесь на просмотр прямо сейчас!\\r\\n\\r\\n📞 Свяжитесь с нами для получения подробной информации и организации просмотра!"}, "action": "create"}	2025-06-14 12:27:42.751	create
cmbw7p864000dky04v5o7cnka	cmbw7p4620001ky04qjh8u4x4	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/3eaa5799-4ccb-46f5-a873-ad524e1dd5e3.jpg", "size": "216KB", "filename": "IMG-20250427-WA0335.jpg"}, {"path": "/uploads/listings/fa15d7c1-9400-4c5c-8c0d-d8d1082610a2.jpg", "size": "216KB", "filename": "IMG-20250427-WA0335.jpg"}, {"path": "/uploads/listings/63677862-763f-4d17-b37c-331a6dba2c8c.jpg", "size": "216KB", "filename": "IMG-20250427-WA0335.jpg"}, {"path": "/uploads/listings/7b08baea-868b-4f07-bc0c-3f9bf8828739.jpg", "size": "216KB", "filename": "IMG-20250427-WA0335.jpg"}]}	2025-06-14 12:27:47.741	images
cmbw8qbhu0003lk04aseygobo	cmbw8qbcg0001lk040x6hhjs0	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 2, "price": 5700000, "title": "2-комнатная квартира 43.9 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Селезнёва, 126", "dealType": "SALE", "latitude": 45.023552, "noShares": true, "condition": "Хорошее", "houseArea": 43.9, "longitude": 39.040989, "yearBuilt": 1979, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8hd8z0009l504mmio8nwo", "fullAddress": "Россия, Краснодар, улица Селезнёва, 126", "listingCode": "К-7710", "totalFloors": 9, "buildingType": "BRICK", "noEncumbrances": true, "publicDescription": "🏢 Уютная двухкомнатная квартира в кирпичном доме в развитом районе города!\\r\\n\\r\\n✨ ПРЕДЛАГАЕТСЯ НА ПРОДАЖУ:\\r\\n• Общая площадь: 43 м²\\r\\n• Жилая площадь: 20 м²\\r\\n• Кухня: 6 м²\\r\\n• Этаж: 2 из 9\\r\\n\\r\\n🏠 О КВАРТИРЕ:\\r\\n• Полностью выполнен капитальный ремонт\\r\\n• Установлены новые пластиковые окна\\r\\n• Декоративная штукатурка на стенах и потолках\\r\\n• Ламинат и стильная плитка на полу\\r\\n• В санузле тёплый пол, подвесной унитаз и бойлер\\r\\n• Новый кухонный гарнитур в кухне\\r\\n• Удобный шкаф-купе в коридоре\\r\\n\\r\\n⚡️ ДОПОЛНИТЕЛЬНЫЕ ПРЕИМУЩЕСТВА:\\r\\n• Заменены электропроводка и сантехника\\r\\n• Качественная отделка\\r\\n• Тёплый и уютный кирпичный дом\\r\\n• Чистый подъезд\\r\\n• Благоустроенный двор\\r\\n\\r\\n📍 ЛОКАЦИЯ:\\r\\n• Район Селезнёва – один из самых удобных для проживания\\r\\n• Развитая инфраструктура: магазины, школы, детские сады\\r\\n• Отличная транспортная доступность\\r\\n• В шаговой доступности остановки общественного транспорта\\r\\n\\r\\n📈 УСЛОВИЯ ПРОДАЖИ:\\r\\n• Квартира от собственника\\r\\n• Без обременений\\r\\n• Быстрый выход на сделку\\r\\n• Возможность покупки в ипотеку\\r\\n• Помощь в одобрении кредита\\r\\n\\r\\nЭта квартира идеально подойдёт как для собственного проживания, так и для инвестиций. Полностью готова к заселению и не требует дополнительных вложений!\\r\\n\\r\\nНе упустите шанс стать владельцем этой замечательной квартиры в развитом районе города! Записывайтесь на просмотр прямо сейчас!\\r\\n\\r\\n📞 Звоните для получения подробной информации и организации просмотра!"}, "action": "create"}	2025-06-14 12:56:38.323	create
cmbw8qd8p0007lk042589q7r0	cmbw8qbcg0001lk040x6hhjs0	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/1ee8608f-d98f-47ab-a700-ac67cf928d13.jpg", "size": "286KB", "filename": "Изображение WhatsApp 2025-05-30 в 22.27.11_24172d2c.jpg"}]}	2025-06-14 12:56:40.586	images
cmbwisbi60001jm043287vjw0	cmbtny34g0001lb04v5ccsltp	cma2nicl30000jo04dsn1zx6i	{"featuredChanged": {"new": "unknown", "newPath": "/uploads/listings/ef626710-78d5-4995-b8ae-a300b15d1c6c.jpg", "previous": "unknown", "previousPath": "/uploads/listings/8c6e648d-1673-405b-9f1d-4b14cfdab2a4.jpg"}}	2025-06-14 17:38:07.806	images
cmbywgajw0003jp04grrcs1ye	cmbywgaeo0001jp04i1bno336	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 2, "price": 5700000, "title": "2-комнатная квартира 43.9 м²", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Селезнёва, 126", "dealType": "SALE", "noShares": true, "houseArea": 43.9, "yearBuilt": 1979, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8hd8z0009l504mmio8nwo", "listingCode": "К-8875", "totalFloors": 9, "noEncumbrances": true, "publicDescription": "🏢 Уютная двухкомнатная квартира в тихом спальном районе города!\\r\\n\\r\\nПредставляем вашему вниманию настоящую находку для комфортного проживания – светлую и просторную квартиру площадью 43,9 квадратных метра. Идеальный вариант для семейного проживания в районе с прекрасно развитой инфраструктурой.\\r\\n\\r\\n✨ Главные преимущества:\\r\\n• Удачное расположение на 2 этаже – нет шума с первых этажей, при этом всегда легко добраться до лифта\\r\\n• Продуманная планировка квартиры\\r\\n• Общая площадь позволяет комфортно разместиться как семье из 3-4 человек\\r\\n• Изолированные комнаты – возможность организовать личное пространство для каждого члена семьи\\r\\n\\r\\n🏠 О квартире:\\r\\n• Свежий современный ремонт\\r\\n• Новые окна с видом на две стороны – естественное освещение в течение всего дня\\r\\n• Раздельный санузел – дополнительный комфорт для всей семьи\\r\\n• Качественные коммуникации\\r\\n• Надежная кирпичная постройка 1979 года – проверенная временем надежность\\r\\n\\r\\n🌳 Район отличается прекрасной транспортной доступностью и обилием зелёных зон. В пешей доступности торговый центр для повседневных нужд, а также школы и детские сады для ваших детей.\\r\\n\\r\\nЭта квартира – идеальный вариант как для собственного проживания, так и для инвестиций. Здесь вас ждёт комфорт и уют в сочетании с разумной стоимостью!\\r\\n\\r\\nЗаписывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! 🔑"}, "action": "create"}	2025-06-16 09:36:13.677	create
cmbywgcai0007jp04469fdi21	cmbywgaeo0001jp04i1bno336	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/c07064ae-82da-40f1-87a3-12dd7bf8417a.jpg", "size": "286KB", "filename": "Изображение WhatsApp 2025-05-30 в 22.27.11_24172d2c.jpg"}]}	2025-06-16 09:36:15.931	images
cmbywvowf0003li04oam6yaos	cmbywvor80001li04b06177j5	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 11, "price": 4800000, "title": "1-комнатная квартира 35 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Кореновская улица, 61", "dealType": "SALE", "latitude": 45.099371, "noShares": true, "condition": "Требуется ремонт", "houseArea": 35, "longitude": 38.984754, "yearBuilt": 2010, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, Кореновская улица, 61", "listingCode": "К-1531", "totalFloors": 18, "windowsView": "COURTYARD", "bathroomType": "SEPARATE", "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "🏢 Роскошная квартира с превосходным видом на две стороны света в престижном районе города!\\r\\n\\r\\nПредставляем вашему вниманию великолепную двухкомнатную квартиру, расположенную на 11 этаже современного жилого комплекса по адресу ул. Кореновская, 61. Это идеальное сочетание комфорта, престижа и продуманной инфраструктуры.\\r\\n\\r\\n✨ Основные характеристики:\\r\\n• Просторная квартира площадью 35 кв.м\\r\\n• 11 этаж – великолепный вид на город и отсутствие шума с нижних этажей\\r\\n• Качественная монолитно-кирпичная постройка 2010 года\\r\\n• Отличная шумоизоляция и комфортная температура в любое время года\\r\\n\\r\\n🏠 Интерьер и оснащение:\\r\\n• Требуется ремонт\\r\\n• Вся необходимая мебель остается новым владельцам\\r\\n• Сплит-система для идеального микроклимата\\r\\n• Металлическая входная дверь\\r\\n• Качественные пластиковые окна\\r\\n\\r\\n🏗 Развитая инфраструктура:\\r\\n• Детский сад и школа в непосредственной близости\\r\\n• Торговый центр всего в 100 метрах\\r\\n• Удобная парковка как во дворе, так и крытая парковка\\r\\n• Благоустроенный двор с детской площадкой\\r\\n\\r\\nЭта квартира – настоящий оазис комфорта и уюта в современном мегаполисе. Здесь продумана каждая деталь для вашего комфортного проживания. \\r\\n\\r\\nНе упустите возможность стать владельцем этой замечательной квартиры в одном из самых удобных для проживания районов города! 🔑"}, "action": "create"}	2025-06-16 09:48:12.112	create
cmbywvqj10007li041199ptta	cmbywvor80001li04b06177j5	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/ba6eb0ba-e459-4734-b701-5f3c16529a60.jpg", "size": "208KB", "filename": "Изображение WhatsApp 2025-05-30 в 20.19.33_ac79c15f.jpg"}]}	2025-06-16 09:48:14.221	images
cmbyx61p20003jl049hfv6rko	cmbyx61ju0001jl04yja2j1bd	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 2, "price": 6400000, "title": "2-комнатная квартира 54 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "ул. Войсковая 22/10", "dealType": "SALE", "noShares": true, "condition": "Хорошее", "houseArea": 54, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "listingCode": "К-7634", "totalFloors": 7, "windowsView": "COURTYARD", "bathroomType": "SEPARATE", "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "🏢 Просторная двухкомнатная квартира в развитом микрорайоне – ваш идеальный выбор для комфортной жизни!\\r\\n\\r\\nПредставляем вашему вниманию великолепную квартиру площадью 54 квадратных метра, расположенную на комфортном втором этаже по адресу ул. Войсковая, 22/10. Это идеальное сочетание простора, уюта и доступности всей необходимой инфраструктуры.\\r\\n\\r\\n✨ Основные преимущества:\\r\\n• Удачная планировка второго этажа – нет шума с первых этажей, при этом всегда легко добраться до лифта\\r\\n• Продуманная планировка квартиры с возможностью организации функциональных зон\\r\\n• Общая площадь позволяет комфортно разместиться как семье из 3-4 человек\\r\\n• Изолированные комнаты – возможность создать личное пространство для каждого члена семьи\\r\\n\\r\\n🏠 О квартире:\\r\\n• Светлая и просторная планировка\\r\\n• Качественные окна с видом на тихий двор\\r\\n• Раздельный санузел для максимального удобства\\r\\n• Надежные коммуникации\\r\\n• Качественная предчистовая отделка – возможность реализовать любые дизайнерские решения\\r\\n\\r\\n🌳 Развитая инфраструктура микрорайона:\\r\\n• В пешей доступности магазины, аптеки и кафе\\r\\n• Школы и детские сады рядом\\r\\n• Удобная транспортная развязка\\r\\n• Благоустроенный двор с детской площадкой\\r\\n\\r\\nЭта квартира станет вашим уютным гнездышком, где каждый найдет для себя место по душе. Здесь вы сможете создать комфортную атмосферу для жизни и отдыха всей семьи.\\r\\n\\r\\nНе упустите возможность стать владельцем этой замечательной квартиры! Записывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! 🔑\\r\\n\\r\\n"}, "action": "create"}	2025-06-16 09:56:15.255	create
cmbyx636z0007jl047j2qq1sl	cmbyx61ju0001jl04yja2j1bd	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/60e5f531-2b88-4b59-86a3-e3808a3a73e6.jpg", "size": "153KB", "filename": "Изображение WhatsApp 2025-05-16 в 19.07.17_50a3ef21.jpg"}]}	2025-06-16 09:56:17.195	images
cmbyxeaxa000bjl04ksp5khw1	cmbyxeas20009jl0477k63b9x	cmah4r0390000n98ec1sazzvm	{"data": {"price": 4100000, "title": "Студия 24 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "6bec98df-22c4-4d2f-9c10-fc9a3fe3fe98", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Евгении Жигуленко, 7к2", "dealType": "SALE", "latitude": 45.096909, "noShares": true, "condition": "Хорошее", "houseArea": 24, "longitude": 39.004841, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица Евгении Жигуленко, 7к2", "listingCode": "К-1275", "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "🏢 Эксклюзивная квартира в престижном жилом комплексе комфорт-класса!\\r\\n\\r\\nПредставляем вашему вниманию великолепную квартиру, расположенную в одном из самых перспективных районов города – ЖК «Радуга», по адресу ул. Жигуленко, 7 корп. 2. Это не просто жилье – это ваш новый уровень комфортной жизни в современном доме!\\r\\n\\r\\n✨ Ключевые преимущества:\\r\\n• Современный монолитно-кирпичный дом с продуманной архитектурой\\r\\n• 21 этаж – великолепные видовые характеристики и отличная инсоляция\\r\\n• Просторные квартиры с продуманными планировками\\r\\n• Высота потолков 2,6 метра – создает ощущение простора\\r\\n\\r\\n🏠 О жилом комплексе:\\r\\n• Закрытая территория с видеонаблюдением\\r\\n• Подземный паркинг на 32 машиноместа\\r\\n• Современная система лифтов (пассажирский и грузовой)\\r\\n• Качественная предчистовая отделка – возможность реализовать любые дизайнерские решения\\r\\n• Развитая инфраструктура на территории комплекса\\r\\n\\r\\n🏗 Локация и инфраструктура:\\r\\n• Развитая транспортная доступность\\r\\n• В пешей доступности вся необходимая инфраструктура: магазины, школы, детские сады\\r\\n• Благоустроенный двор без машин\\r\\n• Зоны отдыха и детские площадки\\r\\n\\r\\nЭта квартира – идеальный вариант как для собственного проживания, так и для инвестиций. Здесь продумана каждая деталь для вашего комфортного проживания в современном жилом комплексе с безупречной репутацией.\\r\\n\\r\\nСтаньте владельцем квартиры в ЖК «Радуга» – выберите комфорт и престиж! Записывайтесь на просмотр прямо сейчас – такие предложения долго не задерживаются! 🔑\\r\\n\\r\\n"}, "action": "create"}	2025-06-16 10:02:40.462	create
cmbyxecf9000fjl04aonbmqmm	cmbyxeas20009jl0477k63b9x	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/35e80e60-1727-4eab-b17a-bc22fbbdbd05.jpg", "size": "189KB", "filename": "Изображение WhatsApp 2025-05-30 в 19.39.30_3a8491d5.jpg"}]}	2025-06-16 10:02:42.405	images
cmbzcbj0k0003jy04vyvci7dd	cmbzcbive0001jy04cor6y5vp	cmah4r0390000n98ec1sazzvm	{"data": {"price": 8500000, "title": "Дом 98 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a16b51bb-e859-42bd-bb86-98fd314fadd7", "userId": "cma17p91m0000n94r28v2tbcr", "address": "городской округ Краснодар, посёлок Российский, улица Владимира Высоцкого, 26/1", "dealType": "SALE", "latitude": 45.119091, "noShares": true, "condition": "Частичный ремонт", "houseArea": 98, "longitude": 39.058425, "categoryId": "cma17xip50001n97czf8u3mhm", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, городской округ Краснодар, посёлок Российский, улица Владимира Высоцкого, 26/1", "listingCode": "Д-4800", "totalFloors": 2, "bathroomType": "COMBINED", "buildingType": "BRICK", "noEncumbrances": true, "publicDescription": " Краснодарский край, Краснодар городской округ, пос. Российский, ул. Высоцкого, 26/1\\r\\n\\r\\nЦена: 7 900 000 рублей\\r\\n\\r\\nСтоимость за м²: 81 359 рублей\\r\\n\\r\\nХарактеристики дома:\\r\\n\\r\\nПлощадь дома: 97,1 м²\\r\\n\\r\\nЭтажность: 2 этажа\\r\\n\\r\\nМатериал стен: газоблоки с утеплителем\\r\\n\\r\\nФасад: белый кирпич\\r\\n\\r\\nОкна: металлопластиковые\\r\\n\\r\\nКрыша: металлочерепица\\r\\n\\r\\nПерекрытия: натяжные потолки\\r\\n\\r\\nТехнические характеристики:\\r\\n\\r\\nТип участка: ИЖС\\r\\n\\r\\nПлощадь участка: 2,5 сотки\\r\\n\\r\\nГод постройки: 2021\\r\\n\\r\\nКоммуникации:\\r\\n\\r\\nЭлектричество (15 кВт)\\r\\n\\r\\nСкважина глубиной 50 м\\r\\n\\r\\nСептик (10 куб.м)\\r\\n\\r\\nОтопление\\r\\n\\r\\nТёплые полы\\r\\n\\r\\nПарковка: есть место для автомобиля\\r\\n\\r\\nСостояние:\\r\\n\\r\\nПервый этаж: выполнен полный ремонт\\r\\n\\r\\nВторой этаж: частично выполнен ремонт\\r\\n\\r\\nИнфраструктура:\\r\\n\\r\\nРасположение: перспективный, развивающийся район\\r\\n\\r\\nВ шаговой доступности:\\r\\n\\r\\nМагазины\\r\\n\\r\\nОстановки общественного транспорта\\r\\n\\r\\nАптеки\\r\\n\\r\\nШколы\\r\\n\\r\\nДетские сады\\r\\n\\r\\nДокументы и сделка:\\r\\n\\r\\nПраво собственности: проверено\\r\\n\\r\\nСрок владения: от 3 до 5 лет\\r\\n\\r\\nКоличество собственников: 2\\r\\n\\r\\nВозможность ипотеки: доступна\\r\\n\\r\\nДом находится в хорошем состоянии, готов к проживанию на первом этаже, что делает его привлекательным вариантом как для постоянного проживания, так и для инвестиций."}, "action": "create"}	2025-06-16 17:00:25.22	create
cmbzcbkqx0007jy04bxhq9bvg	cmbzcbive0001jy04cor6y5vp	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/07476330-75d9-412f-ac16-da4cc73efe7f.jpg", "size": "206KB", "filename": "Изображение WhatsApp 2025-05-30 в 21.19.34_e2c757d7.jpg"}]}	2025-06-16 17:00:27.465	images
cmbzdcxjf0003l1045skrv7g2	cmbzdcxe50001l104zymr6adk	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 4, "price": 6200000, "title": "2-комнатная квартира 56 м²", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Домбайская улица, 55к5", "dealType": "SALE", "latitude": 45.070791, "noShares": true, "condition": "Хорошее", "houseArea": 56, "longitude": 39.035734, "yearBuilt": 2023, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, Домбайская улица, 55к5", "kitchenArea": 10.9, "listingCode": "К-1346", "totalFloors": 23, "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "Краснодар, Прикубанский округ, ул. Домбайская, 55/5\\r\\n\\r\\nТип объекта: 2-комнатная квартира\\r\\n\\r\\nЦена: 5 900 000 рублей\\r\\n\\r\\nПлощадь: 56 м²\\r\\n\\r\\nЭтаж: 4 из 24\\r\\n\\r\\nТип дома: кирпично-монолитный\\r\\n\\r\\nГод постройки: 2023\\r\\n\\r\\nПланировка и характеристики:\\r\\n\\r\\nРаздельные комнаты\\r\\n\\r\\nДизайнерский ремонт\\r\\n\\r\\nВысота потолков: 2.7 м\\r\\n\\r\\nПлощадь кухни: 11 м²\\r\\n\\r\\nНаличие: 2 лоджии\\r\\n\\r\\nДополнительно: теплый пол\\r\\n\\r\\nИнфраструктура района:\\r\\n\\r\\nМикрорайон: Губернский\\r\\n\\r\\nТранспортная доступность: остановка общественного транспорта в пешей доступности\\r\\n\\r\\nСоциальная инфраструктура:\\r\\n\\r\\nНовая школа\\r\\n\\r\\nДва детских сада\\r\\n\\r\\nДетская и взрослая поликлиники\\r\\n\\r\\nФитнес-центр\\r\\n\\r\\nТорговые объекты:\\r\\n\\r\\nСупермаркеты\\r\\n\\r\\nАптеки\\r\\n\\r\\nРазличные магазины\\r\\n\\r\\nДля детей:\\r\\n\\r\\nОборудованные детские площадки\\r\\n\\r\\nСпортивные площадки\\r\\n\\r\\nКоммуникации и удобства:\\r\\n\\r\\nКоличество лифтов: 3\\r\\n\\r\\nОбременения: отсутствуют\\r\\n\\r\\nВозможность ипотеки: доступна\\r\\n\\r\\nКвартира расположена в современном доме комфорт-класса с продуманной планировкой и качественным ремонтом. Отличное решение как для собственного проживания, так и для инвестиций. Развитая инфраструктура района обеспечивает все необходимое для комфортной жизни."}, "action": "create"}	2025-06-16 17:29:30.315	create
cmbzdtyln000bl104tg9talrd	cmbzdtyge0009l104st0ti06v	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 11, "price": 7100000, "title": "2-комнатная квартира 67 м²", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Домбайская улица, 61", "dealType": "SALE", "latitude": 45.072433, "noShares": false, "condition": "Евроремонт", "houseArea": 67, "longitude": 39.03851, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, Домбайская улица, 61", "kitchenArea": 12.7, "listingCode": "К-3858", "totalFloors": 24, "noEncumbrances": false, "publicDescription": "Краснодар, Прикубанский округ, ул. Домбайская, 61\\r\\n\\r\\nТип объекта: 2-комнатная квартира\\r\\n\\r\\n\\r\\nЭтаж: 11 из 24\\r\\n\\r\\nГод постройки: 2018\\r\\n\\r\\nПланировка и площадь:\\r\\n\\r\\nОбщая площадь: 61,6 м²\\r\\n\\r\\nЖилая площадь: 30,3 м²\\r\\n\\r\\nПлощадь кухни: 12,7 м²\\r\\n\\r\\nСанузел: раздельный\\r\\n\\r\\nБалкон: есть\\r\\n\\r\\nРемонт: евроремонт\\r\\n\\r\\nХарактеристики дома:\\r\\n\\r\\nТип постройки: индивидуальный проект\\r\\n\\r\\nЛифты: 2 пассажирских + 1 грузовой\\r\\n\\r\\nПерекрытия: железобетонные\\r\\n\\r\\nПарковка: наземная\\r\\n\\r\\nОтопление: индивидуальный тепловой пункт\\r\\n\\r\\nИнфраструктура района:\\r\\n\\r\\nРазвитая территория:\\r\\n\\r\\nЗона отдыха с зеленым ландшафтом\\r\\n\\r\\nИгровые площадки с безопасным покрытием\\r\\n\\r\\nДетская площадка\\r\\n\\r\\nПарковка\\r\\n\\r\\nВ шаговой доступности:\\r\\n\\r\\nШколы и детские сады\\r\\n\\r\\nМагазины и супермаркеты\\r\\n\\r\\nТорговые центры\\r\\n\\r\\nКафе и рестораны\\r\\n\\r\\nФитнес-центр 50 GYM (100 м от дома)\\r\\n\\r\\nТранспортная доступность:\\r\\n\\r\\nУдобная дорожная развязка\\r\\n\\r\\nОстановки общественного транспорта\\r\\n\\r\\nДополнительные преимущества:\\r\\n\\r\\nИпотека: возможна \\r\\n\\r\\nТип сделки: свободная продажа\\r\\n\\r\\nОбременений: нет\\r\\n\\r\\nДокументы: готовы к сделке\\r\\n\\r\\nКвартира расположена в одном из самых развитых районов Краснодара, что делает её привлекательным вариантом как для собственного проживания, так и для инвестиций. Качественная инфраструктура и транспортная доступность создают все условия для комфортной жизни."}, "action": "create"}	2025-06-16 17:42:44.843	create
cmbzdu0an000fl1042rda0hfl	cmbzdtyge0009l104st0ti06v	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/3996b6da-dccc-4db7-ac85-2e21f8f25100.jpg", "size": "287KB", "filename": "Изображение WhatsApp 2025-05-30 в 20.58.06_227ed69e.jpg"}]}	2025-06-16 17:42:47.039	images
cmbzfeu7v0003l40490j2vkys	cmbzfeu2m0001l404bz3gau95	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 16, "price": 5850000, "title": "1-комнатная квартира 38.4 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Восточно-Кругликовская улица, 22/3", "dealType": "SALE", "latitude": 45.04773, "noShares": false, "condition": "Хорошее", "houseArea": 38.4, "longitude": 39.030847, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, Восточно-Кругликовская улица, 22/3", "listingCode": "К-9101", "totalFloors": 16, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": " Краснодар, ул. Восточно-Кругликовская, 22/3\\r\\n\\r\\nТип объекта: 1-комнатная квартира\\r\\n\\r\\nПлощадь: 38,4 м²\\r\\n\\r\\nЭтаж: 16 из 16\\r\\n\\r\\nЦена: 5 850 000 рублей\\r\\n\\r\\n\\r\\n\\r\\nПланировка и характеристики:\\r\\n\\r\\nОбщая площадь: 38,4 м²\\r\\n\\r\\nЖилая площадь: 19 м²\\r\\n\\r\\nПлощадь кухни: 12 м²\\r\\n\\r\\nСанузел: совместный\\r\\n\\r\\n\\r\\n\\r\\n\\r\\n\\r\\nРемонт: хороший\\r\\n\\r\\nОсобенности квартиры:\\r\\n\\r\\nСовместный санузел с качественной отделкой\\r\\n\\r\\nЗастекленный балкон\\r\\n\\r\\nПластиковые окна\\r\\n\\r\\nНадёжная входная дверь\\r\\n\\r\\nСовременная система освещения\\r\\n\\r\\nКачественная отделка (ламинат, натяжные потолки)\\r\\n\\r\\nИнфраструктура и окружение:\\r\\n\\r\\nРазвитая инфраструктура района:\\r\\n\\r\\nШколы и детские сады в пешей доступности\\r\\n\\r\\nМагазины, супермаркеты и аптеки\\r\\n\\r\\nФитнес-центры и спортивные площадки\\r\\n\\r\\nЗоны отдыха и детские площадки\\r\\n\\r\\nТранспортная доступность:\\r\\n\\r\\nУдобная транспортная развязка\\r\\n\\r\\nЛегко добраться в любой район города\\r\\n\\r\\nДополнительные удобства:\\r\\n\\r\\nДомофон\\r\\n\\r\\nИнтернет и телефон\\r\\n\\r\\nКабельное телевидение\\r\\n\\r\\nСовременный ремонт\\r\\n\\r\\nКухонный гарнитур\\r\\n\\r\\nШкаф-купе\\r\\n\\r\\nКвартира находится в отличном состоянии и готова к заселению. Расположена в одном из престижных районов города с хорошо развитой инфраструктурой. Прекрасный вариант как для собственного проживания, так и для инвестиций.\\r\\n\\r\\n"}, "action": "create"}	2025-06-16 18:26:58.555	create
cmbzfew9o0007l404u0m39doa	cmbzfeu2m0001l404bz3gau95	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/3a62c90b-ca19-4a62-9f66-90f03942b21c.jpg", "size": "328KB", "filename": "Изображение WhatsApp 2025-05-30 в 21.07.41_7fd92aff.jpg"}]}	2025-06-16 18:27:01.212	images
cmc07a5k80001n9qe6uhxtxz6	cmbw7p4620001ky04qjh8u4x4	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {}}	2025-06-17 07:27:09.222	update
cmc07axid0003n9qe8xf1kffe	cmbzdtyge0009l104st0ti06v	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"cityId": {"new": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "old": null}}}	2025-06-17 07:27:45.445	update
cmc07bqgt0005n9qedz6uhejp	cmbzdcxe50001l104zymr6adk	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"cityId": {"new": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "old": null}}}	2025-06-17 07:28:22.973	update
cmc07bu470007n9qerxs4ak2v	cmbywgaeo0001jp04i1bno336	cma2nicl30000jo04dsn1zx6i	{"action": "update_fields", "fields": {"cityId": {"new": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "old": null}}}	2025-06-17 07:28:27.703	update
cmc0blkly0003i4048amgi9mk	cmc0blkgu0001i404rwszqlt4	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 18, "price": 5300000, "title": "1-комнатная квартира 41.9 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Дубравная улица, 1", "dealType": "SALE", "latitude": 45.139732, "noShares": false, "condition": "Хорошее", "houseArea": 41.9, "longitude": 38.986677, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, Дубравная улица, 1", "listingCode": "К-1873", "totalFloors": 19, "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается шикарная квартира"}, "action": "create"}	2025-06-17 09:28:00.406	create
cmc0blmmq0007i404d1jan4db	cmc0blkgu0001i404rwszqlt4	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/a9871d81-7539-4595-be3f-45d4c24d30ed.jpg", "size": "326KB", "filename": "Изображение WhatsApp 2025-06-02 в 21.21.41_c6b6ff63.jpg"}]}	2025-06-17 09:28:03.027	images
cmc0dqsst0003jp04g6gwd8vz	cmc0dqsng0001jp045rk6eltj	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 19, "price": 4350000, "title": "Студия 23 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "6bec98df-22c4-4d2f-9c10-fc9a3fe3fe98", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени 40-летия Победы, 178к2", "dealType": "SALE", "latitude": 45.054658, "noShares": false, "condition": "Ремонт от застройщика", "houseArea": 23, "longitude": 39.03214, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, улица имени 40-летия Победы, 178к2", "listingCode": "К-9621", "totalFloors": 20, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается хорошая квартира"}, "action": "create"}	2025-06-17 10:28:03.533	create
cmc0e0hsv0003ie04b3fiiqjg	cmc0e0hns0001ie04xazcx1q5	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 0, "price": 2250000, "title": "Офис 20 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "ef9ff24a-852f-4f53-a555-e190886aa646", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, микрорайон Юбилейный, проспект Чекистов, 40", "dealType": "SALE", "latitude": 45.031884, "noShares": false, "condition": "Хорошее", "houseArea": 20, "longitude": 38.918917, "categoryId": "cma17xo0z0003n97c87a2l7nj", "districtId": "cmal7i3r30000n9jb49irduyh", "fullAddress": "Россия, Краснодар, микрорайон Юбилейный, проспект Чекистов, 40", "listingCode": "К-2483", "buildingType": "PANEL", "noEncumbrances": false, "publicDescription": "Продается коммерция цоколь"}, "action": "create"}	2025-06-17 10:35:35.84	create
cmc0e0j970007ie04rzathc2w	cmc0e0hns0001ie04xazcx1q5	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/11aeda21-9c42-42cd-94ba-5754e0134b0c.jpg", "size": "118KB", "filename": "Изображение WhatsApp 2025-05-30 в 22.04.31_ff458893.jpg"}]}	2025-06-17 10:35:37.724	images
cmc0ei7ux000bie04bwk9sruh	cmc0ei7px0009ie04tn1ihmvt	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 7, "price": 5300000, "title": "2-комнатная квартира 51 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени 40-летия Победы, 146/6к1", "dealType": "SALE", "latitude": 45.052073, "noShares": false, "condition": "Хорошее", "houseArea": 51, "longitude": 39.021145, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица имени 40-летия Победы, 146/6к1", "listingCode": "К-8436", "totalFloors": 9, "bathroomType": "SEPARATE", "buildingType": "BRICK", "noEncumbrances": false, "publicDescription": "Продается 2-х комнатная квартира"}, "action": "create"}	2025-06-17 10:49:22.761	create
cmc0ei8z6000fie04o6j8x0ci	cmc0ei7px0009ie04tn1ihmvt	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/203c33b1-4fdb-4784-b7b5-9731ef8ea539.jpg", "size": "49KB", "filename": "Изображение WhatsApp 2025-05-31 в 17.32.35_65eaa5e4.jpg"}]}	2025-06-17 10:49:24.21	images
cmc0f36ei0003ld04q209a49k	cmc0f369e0001ld04gwcm2kcz	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 2, "price": 6000000, "title": "2-комнатная квартира", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Калининский переулок, 40", "dealType": "SALE", "landArea": 52.3, "latitude": 45.047985, "noShares": false, "condition": "Хорошее", "longitude": 39.021783, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, Калининский переулок, 40", "listingCode": "К-2481", "totalFloors": 3, "windowsView": "COURTYARD", "bathroomType": "SEPARATE", "buildingType": "BRICK", "noEncumbrances": false, "publicDescription": "Продается 2-х ком квартира"}, "action": "create"}	2025-06-17 11:05:40.651	create
cmc0f383f0007ld04x30d1twm	cmc0f369e0001ld04gwcm2kcz	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/8ea18c92-0c3d-4ec7-ae9e-e60a86179aac.jpg", "size": "228KB", "filename": "Изображение WhatsApp 2025-05-31 в 18.30.45_05468bc5.jpg"}]}	2025-06-17 11:05:42.843	images
cmc0forne000bld04vmjxd6nj	cmc0forfn0009ld04zx62jqfa	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 18, "price": 3900000, "title": "1-комнатная квартира 45.6 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Гидростроителей, 59/2лит1", "dealType": "SALE", "latitude": 45.001957, "noShares": false, "condition": "Предчистовая", "houseArea": 45.6, "longitude": 39.087162, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8hd8z0009l504mmio8nwo", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица Гидростроителей, 59/2лит1", "listingCode": "К-4999", "windowsView": "STREET", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 1 ком квартира"}, "action": "create"}	2025-06-17 11:22:27.963	create
cmc0fotdu000fld04llf1g8kh	cmc0forfn0009ld04zx62jqfa	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/f0085448-2b5a-4085-b400-2df24480811f.jpg", "size": "248KB", "filename": "Изображение WhatsApp 2025-06-03 в 18.15.36_ea582473.jpg"}]}	2025-06-17 11:22:30.211	images
cmc0e6ihh0003l404rnrqlp6h	cmc0e6ic60001l4041sbcd69g	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 3, "price": 5300000, "title": "2-комнатная квартира 44.3 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Защитников Отечества", "dealType": "SALE", "latitude": 45.095821, "noShares": false, "condition": "Хорошее", "houseArea": 44.3, "longitude": 39.010168, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, Прикубанский внутригородской округ, микрорайон имени Петра Метальникова, улица Защитников Отечества", "kitchenArea": 13.9, "listingCode": "К-5686", "totalFloors": 7, "bathroomType": "SEPARATE", "buildingType": "PANEL", "noEncumbrances": false, "publicDescription": "Продается хорошая квартира"}, "action": "create"}	2025-06-17 10:40:16.661	create
cmc0e6k660007l404lu6947dr	cmc0e6ic60001l4041sbcd69g	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/ef246c63-20be-452f-9ea2-ce54211913f7.jpg", "size": "167KB", "filename": "Изображение WhatsApp 2025-05-30 в 22.22.36_c962911f.jpg"}]}	2025-06-17 10:40:18.847	images
cmc0evjyu0003l504z063pv5g	cmc0evjtm0001l504z6uo7t2f	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 1, "price": 4200000, "title": "1-комнатная квартира 35.2 м²", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени 40-летия Победы, 97/2", "dealType": "SALE", "latitude": 45.057148, "noShares": false, "condition": "Хорошее", "houseArea": 35.2, "longitude": 39.02932, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, улица имени 40-летия Победы, 97/2", "listingCode": "К-6181", "totalFloors": 16, "bathroomType": "COMBINED", "buildingType": "PANEL", "noEncumbrances": false, "publicDescription": "Продается 1-ком квартира "}, "action": "create"}	2025-06-17 10:59:44.982	create
cmc0evlhi0007l504okvgjulf	cmc0evjtm0001l504z6uo7t2f	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/1e0e5b5f-8e15-40f2-9d5a-414689c7f6d0.jpg", "size": "170KB", "filename": "Изображение WhatsApp 2025-05-31 в 18.07.11_9e15ce62.jpg"}]}	2025-06-17 10:59:46.95	images
cmc0fhy4m000bl50470unuudd	cmc0fhxzc0009l504lz60laxs	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 5, "price": 4900000, "title": "1-комнатная квартира 38.2 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени Снесарева, 10к3", "dealType": "SALE", "latitude": 44.996304, "noShares": false, "condition": "Хорошее", "houseArea": 38.2, "longitude": 39.078682, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8hd8z0009l504mmio8nwo", "fullAddress": "Россия, Краснодар, улица имени Снесарева, 10к3", "listingCode": "К-4907", "totalFloors": 23, "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 1 ком квартира"}, "action": "create"}	2025-06-17 11:17:09.766	create
cmc0g94ct0003jr04nhz64rwg	cmc0g947t0001jr04i6pi12ow	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 1, "price": 6900000, "title": "2-комнатная квартира 50 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Западный Обход, 39/2к4", "dealType": "SALE", "latitude": 45.093817, "noShares": true, "condition": "Хорошее", "houseArea": 50, "longitude": 38.904131, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8i29q000al504j8j8rsj7", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, улица Западный Обход, 39/2к4", "listingCode": "К-4020", "totalFloors": 18, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "Продается 2-ком квартира"}, "action": "create"}	2025-06-17 11:38:17.549	create
cmc0g95uf0007jr0443mv3ils	cmc0g947t0001jr04i6pi12ow	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/494786c3-8e13-440f-889b-088a9c87bc2f.jpg", "size": "156KB", "filename": "Изображение WhatsApp 2025-06-09 в 20.51.00_553cd896.jpg"}]}	2025-06-17 11:38:19.48	images
cmc0geym60003lb04o26qyu1e	cmc0geyh10001lb0402e2oqdo	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 1, "price": 7150000, "title": "2-комнатная квартира 53.9 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица Западный Обход, 39/2к3", "dealType": "SALE", "latitude": 45.092805, "noShares": false, "condition": "Хорошее", "houseArea": 53.9, "longitude": 38.904131, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8i29q000al504j8j8rsj7", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица Западный Обход, 39/2к3", "listingCode": "К-6755", "totalFloors": 18, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 2- км квартира"}, "action": "create"}	2025-06-17 11:42:50.047	create
cmc0gf0if0007lb047rx3wz6j	cmc0geyh10001lb0402e2oqdo	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/fc04bd89-2dbf-421c-862e-53efdf2ec580.jpg", "size": "214KB", "filename": "Изображение WhatsApp 2025-06-09 в 20.59.04_4f834686.jpg"}]}	2025-06-17 11:42:52.503	images
cmc1ojpm4000bk3040619di8d	cmc1ojph20009k304e30nhtsq	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 18, "price": 6300000, "title": "1-комнатная квартира 36 м²", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица им. Героя Яцкова И.В., 15к1", "dealType": "SALE", "latitude": 45.070848, "noShares": false, "condition": "Хорошее", "houseArea": 36, "longitude": 39.039066, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "LOGGIA", "fullAddress": "Россия, Краснодар, улица им. Героя Яцкова И.В., 15к1", "listingCode": "К-3484", "totalFloors": 18, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается квартира"}, "action": "create"}	2025-06-18 08:18:14.764	create
cmc1mgc190003if04h392vliv	cmc1mgbw30001if04vmqbpha1	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 7, "price": 5050000, "title": "1-комнатная квартира 31 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Воронежская улица, 47/14", "dealType": "SALE", "latitude": 44.999797, "noShares": false, "condition": "Предчистовая", "houseArea": 31, "longitude": 39.03117, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8hd8z0009l504mmio8nwo", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, Воронежская улица, 47/14", "kitchenArea": 11.8, "listingCode": "К-2670", "totalFloors": 17, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 1-комнатная квартира"}, "action": "create"}	2025-06-18 07:19:37.965	create
cmc1mgdnk0007if044nifhwnx	cmc1mgbw30001if04vmqbpha1	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/128dfbdb-de19-4c89-8db2-491143a25e5c.jpg", "size": "172KB", "filename": "Изображение WhatsApp 2025-06-10 в 11.06.40_867c442e.jpg"}]}	2025-06-18 07:19:40.065	images
cmc1nls880003l704cd6znu4t	cmc1nls2y0001l704d7z81uph	cmah4r0390000n98ec1sazzvm	{"data": {"price": 6200000, "title": "Дом 70 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a16b51bb-e859-42bd-bb86-98fd314fadd7", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/5", "dealType": "SALE", "latitude": 45.086416, "noShares": false, "condition": "Предчистовая", "houseArea": 70, "longitude": 39.080623, "categoryId": "cma17xip50001n97czf8u3mhm", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/5", "listingCode": "Д-9202", "windowsView": "COURTYARD", "bathroomType": "COMBINED", "buildingType": "BRICK", "noEncumbrances": false, "publicDescription": "Продается дом ПЧО"}, "action": "create"}	2025-06-18 07:51:51.848	create
cmc1nlu1f0007l704mcn62224	cmc1nls2y0001l704d7z81uph	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/3826116d-122a-4ce3-8d29-8df49779da3d.jpg", "size": "330KB", "filename": "Изображение WhatsApp 2025-06-03 в 20.04.32_5983d7c0.jpg"}]}	2025-06-18 07:51:54.196	images
cmc1nuszp0003jj045xzyuekp	cmc1nusum0001jj04gg4pocmb	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 15, "price": 5700000, "title": "1-комнатная квартира 35 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица им. Героя Яцкова И.В., 19к2", "dealType": "SALE", "latitude": 45.070969, "noShares": true, "condition": "Хорошее", "houseArea": 35, "longitude": 39.042588, "yearBuilt": 2022, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица им. Героя Яцкова И.В., 19к2", "kitchenArea": 8.5, "listingCode": "К-3655", "totalFloors": 20, "bathroomType": "COMBINED", "buildingType": "PANEL", "noEncumbrances": true, "publicDescription": " Продается уютная однокомнатная квартира по адресу: ул. Им. Героя Яцкова, 19к2\\r\\n\\r\\nОбщая площадь: 35 кв.м\\r\\nЖилая площадь: 15 кв.м\\r\\nПлощадь кухни: 8,5 кв.м\\r\\n\\r\\nОписание квартиры:\\r\\n\\r\\nЭтаж: 15 из 20, что обеспечивает хорошую шумоизоляцию и отсутствие шума с улицы.\\r\\n\\r\\nСостояние: Квартира без ремонта, предчистовая отделка, что позволяет реализовать любые дизайнерские решения.\\r\\n\\r\\nИнфраструктура: Квартира расположена в одном из лучших районов города, в ЖК “Губернский”. Развитая инфраструктура включает три детских сада, школу, супермаркеты (Пятёрочка и Магнит), а также множество кафе и детских площадок.\\r\\n\\r\\nУдобства: На первых этажах расположены коммерческие помещения, что обеспечивает дополнительные удобства для жителей. Организована еженедельная фермерская торговля по субботам.\\r\\n\\r\\nДом: Дом построен в 2022 году застройщиком ЮСИ. Качественные материалы и надежная конструкция. В доме установлены железобетонные перекрытия, один пассажирский и один грузовой лифт.\\r\\n\\r\\nДополнительно: Квартира без обременений, документы готовы к сделке. Возможна ипотека.\\r\\n\\r\\nЭта квартира станет отличным выбором для тех, кто ценит комфорт и удобство современной городской жизни! Приглашаем на просмотр! 🔑\\r\\n\\r\\n"}, "action": "create"}	2025-06-18 07:58:52.742	create
cmc1nuuk30007jj04lbxgm9vz	cmc1nusum0001jj04gg4pocmb	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/f52e6d91-72dd-40d9-bac8-a229e57798d5.jpg", "size": "142KB", "filename": "Изображение WhatsApp 2025-06-03 в 22.23.58_95f9cda2.jpg"}]}	2025-06-18 07:58:54.771	images
cmc1o2hor000bl704ntmlaj5i	cmc1o2hje0009l704f42bxnyg	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 12, "price": 7900000, "title": "2-комнатная квартира 65 м²", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Российская улица, 72/6", "dealType": "SALE", "latitude": 45.053971, "noShares": false, "condition": "Предчистовая", "houseArea": 65, "longitude": 39.019789, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, Российская улица, 72/6", "listingCode": "К-5291", "totalFloors": 18, "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается уютная однокомнатная квартира по адресу: ул. Им. Героя Яцкова, 19к2"}, "action": "create"}	2025-06-18 08:04:51.339	create
cmc1o2ip7000fl7045bnsq84u	cmc1o2hje0009l704f42bxnyg	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/930d5e3b-6b17-484b-88dd-ad7548dec245.jpg", "size": "17KB", "filename": "Изображение WhatsApp 2025-06-06 в 17.16.28_9ed4d663.jpg"}]}	2025-06-18 08:04:52.651	images
cmc1o9ubs0003k304ame7p02b	cmc1o9u6h0001k304hfk6ls9c	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 17, "price": 8100000, "title": "2-комнатная квартира 60.7 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "a359a2cd-42c3-4f24-83e0-1432618b988e", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица имени Героя Николая Шевелёва, 3/1", "dealType": "SALE", "latitude": 45.074744, "noShares": false, "condition": "Хорошее", "houseArea": 60.7, "longitude": 39.03762, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица имени Героя Николая Шевелёва, 3/1", "listingCode": "К-7982", "totalFloors": 17, "bathroomType": "SEPARATE", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 2 ком квартира"}, "action": "create"}	2025-06-18 08:10:34.312	create
cmc1o9vxk0007k304yyeip712	cmc1o9u6h0001k304hfk6ls9c	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/aefd19fc-72c8-4e4c-81df-9876ec0d85d4.jpg", "size": "149KB", "filename": "Изображение WhatsApp 2025-06-06 в 17.20.15_3d10544f.jpg"}]}	2025-06-18 08:10:36.393	images
cmc1oel7y000bjj048n3ss9li	cmc1oel2n0009jj04z49g0x4h	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 13, "price": 5100000, "title": "1-комнатная квартира 38 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица им. Героя Яцкова И.В., 15к1", "dealType": "SALE", "latitude": 45.070848, "noShares": false, "condition": "Хорошее", "houseArea": 38, "longitude": 39.039066, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица им. Героя Яцкова И.В., 15к1", "listingCode": "К-9314", "totalFloors": 18, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 1 ком квартира"}, "action": "create"}	2025-06-18 08:14:15.791	create
cmc1oemt1000fjj04if1xp8p0	cmc1oel2n0009jj04z49g0x4h	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/a498b988-9d94-482c-b549-bc49b0f5ad72.jpg", "size": "198KB", "filename": "Изображение WhatsApp 2025-06-06 в 17.29.24_120e40a3.jpg"}]}	2025-06-18 08:14:17.845	images
cmc1oubh0000jl704ucxr6aoo	cmc1oubbt000hl704t4bk4k5p	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 14, "price": 9250000, "title": "3-комнатная квартира 70 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "d4d608d6-f69a-4030-bd5b-1d73dc243be2", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, Боспорская улица, 14", "dealType": "SALE", "latitude": 45.077175, "noShares": false, "condition": "Предчистовая", "houseArea": 70, "longitude": 39.036641, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, Боспорская улица, 14", "listingCode": "К-1821", "totalFloors": 22, "windowsView": "COURTYARD", "bathroomType": "SEPARATE", "buildingType": "MONOLITH_BRICK", "noEncumbrances": false, "publicDescription": "Продается 3-х комнатная квартира"}, "action": "create"}	2025-06-18 08:26:29.652	create
cmc1oud1z000nl704qz0nhsgz	cmc1oubbt000hl704t4bk4k5p	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/99dcbbb7-ccee-4a4c-a5d3-50bca310b017.jpg", "size": "18KB", "filename": "Изображение WhatsApp 2025-06-06 в 18.31.18_8d4d54b4.jpg"}]}	2025-06-18 08:26:31.704	images
cmc1ozj6h000lk304l7m3pjsh	cmc1ozj15000jk304a6gmdppl	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 9, "price": 5700000, "title": "1-комнатная квартира 38 м²", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Краснодар, улица им. Героя Яцкова И.В., 19к2", "dealType": "SALE", "latitude": 45.070969, "noShares": true, "condition": "Хорошее", "houseArea": 38, "longitude": 39.042588, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "balconyType": "BALCONY", "fullAddress": "Россия, Краснодар, улица им. Героя Яцкова И.В., 19к2", "listingCode": "К-3197", "totalFloors": 18, "bathroomType": "COMBINED", "buildingType": "MONOLITH_BRICK", "noEncumbrances": true, "publicDescription": "Продается 1- комнатная квартира"}, "action": "create"}	2025-06-18 08:30:32.921	create
cmc1ozkqm000pk304ce6448th	cmc1ozj15000jk304a6gmdppl	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/3c6d2b01-410d-4f9a-bd74-cc42791c9ef2.jpg", "size": "151KB", "filename": "Изображение WhatsApp 2025-06-09 в 21.17.59_00cc1840.jpg"}]}	2025-06-18 08:30:34.942	images
cmc1qtqef0003l804i9dnjskg	cmc1qtq990001l804uiwh34w8	cmah4r0390000n98ec1sazzvm	{"data": {"floor": 5, "price": 2600000, "title": "1-комнатная квартира 33.4 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "559c2a97-40b4-4fcc-80be-618c18f07f55", "userId": "cma17p91m0000n94r28v2tbcr", "address": "городской округ Краснодар, посёлок Краснодарский, литД", "dealType": "SALE", "latitude": 45.084405, "noShares": false, "condition": "Предчистовая", "houseArea": 33.4, "longitude": 39.046702, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmaianwry0000n9hb03zlv221", "fullAddress": "Россия, городской округ Краснодар, посёлок Краснодарский, литД", "listingCode": "К-6739", "totalFloors": 6, "bathroomType": "COMBINED", "buildingType": "BRICK", "noEncumbrances": false, "publicDescription": "Продается 1 комнатная квартира"}, "action": "create"}	2025-06-18 09:22:01.576	create
cmc1qtsas0007l804q93lu3oa	cmc1qtq990001l804uiwh34w8	cmah4r0390000n98ec1sazzvm	{"added": [{"path": "/uploads/listings/f1367cd4-f133-441c-b016-dca521fc381e.jpg", "size": "383KB", "filename": "Изображение WhatsApp 2025-05-31 в 17.25.12_b1b6c19a.jpg"}]}	2025-06-18 09:22:04.036	images
cmc1yuhf20001jp0ag5vecoy8	cmc1pvslk0001lc048lnqmzi5	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Скандинавская улица, 1к1", "old": "Краснодар, Скандинавская улица, 1"}, "fullAddress": {"new": "Россия, Краснодар, Скандинавская улица, 1к1", "old": "Россия, Краснодар, Скандинавская улица, 1"}}}	2025-06-18 13:06:33.519	update
cmc1ywdrv0003jp0a5sl57zmd	cmc1ozj15000jk304a6gmdppl	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица им. Героя Яцкова И.В., 19к3", "old": "Краснодар, улица им. Героя Яцкова И.В., 19к2"}, "fullAddress": {"new": "Россия, Краснодар, улица им. Героя Яцкова И.В., 19к3", "old": "Россия, Краснодар, улица им. Героя Яцкова И.В., 19к2"}}}	2025-06-18 13:08:02.107	update
cmc1yy69t0005jp0aftxyfchu	cmc1oubbt000hl704t4bk4k5p	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Боспорская улица, 12", "old": "Краснодар, Боспорская улица, 14"}, "fullAddress": {"new": "Россия, Краснодар, Боспорская улица, 12", "old": "Россия, Краснодар, Боспорская улица, 14"}}}	2025-06-18 13:09:25.697	update
cmc1z09v80001ky04xr22vr95	cmc1ojph20009k304e30nhtsq	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени Героя Николая Шевелёва, 2", "old": "Краснодар, улица имени Героя Николая Шевелёва, 5"}, "fullAddress": {"new": "Россия, Краснодар, улица имени Героя Николая Шевелёва, 2", "old": "Россия, Краснодар, улица имени Героя Николая Шевелёва, 5"}}}	2025-06-18 13:11:03.668	update
cmc1z1y3k0003ky04or3eziq9	cmc1oel2n0009jj04z49g0x4h	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица им. Героя Яцкова И.В., 15к2", "old": "Краснодар, улица им. Героя Яцкова И.В., 15к1"}, "fullAddress": {"new": "Россия, Краснодар, улица им. Героя Яцкова И.В., 15к2", "old": "Россия, Краснодар, улица им. Героя Яцкова И.В., 15к1"}}}	2025-06-18 13:12:21.728	update
cmc1z47m00007jp0af5o47f7y	cmc1o9u6h0001k304hfk6ls9c	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени Героя Николая Шевелёва, 3", "old": "Краснодар, улица имени Героя Николая Шевелёва, 3/1"}, "fullAddress": {"new": "Россия, Краснодар, улица имени Героя Николая Шевелёва, 3", "old": "Россия, Краснодар, улица имени Героя Николая Шевелёва, 3/1"}}}	2025-06-18 13:14:07.369	update
cmc1z7z3y0007ky04fvmax7pv	cmc1nusum0001jj04gg4pocmb	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица им. Героя Яцкова И.В., 19к3", "old": "Краснодар, улица им. Героя Яцкова И.В., 19к2"}, "fullAddress": {"new": "Россия, Краснодар, улица им. Героя Яцкова И.В., 19к3", "old": "Россия, Краснодар, улица им. Героя Яцкова И.В., 19к2"}}}	2025-06-18 13:17:02.975	update
cmc1z9h9c0001l104gofnsyzi	cmc1nls2y0001l704d7z81uph	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/7", "old": "Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/5"}, "fullAddress": {"new": "Россия, Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/7", "old": "Россия, Краснодар, коттеджный посёлок Крепость, Новомихайловская улица, 42/5"}}}	2025-06-18 13:18:13.153	update
cmc1zaldd0009jp0ar4u7ahh8	cmc1mgbw30001if04vmqbpha1	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Воронежская улица, 47/10", "old": "Краснодар, Воронежская улица, 47/14"}, "fullAddress": {"new": "Россия, Краснодар, Воронежская улица, 47/10", "old": "Россия, Краснодар, Воронежская улица, 47/14"}}}	2025-06-18 13:19:05.137	update
cmc1zcd67000bjp0ajhd3vhya	cmc0geyh10001lb0402e2oqdo	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица Западный Обход, 39/2к5", "old": "Краснодар, улица Западный Обход, 39/2к3"}, "fullAddress": {"new": "Россия, Краснодар, улица Западный Обход, 39/2к5", "old": "Россия, Краснодар, улица Западный Обход, 39/2к3"}}}	2025-06-18 13:20:27.824	update
cmc1zdt6j000djp0a5wv43ezq	cmc0g947t0001jr04i6pi12ow	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица Западный Обход, 39/2к2", "old": "Краснодар, улица Западный Обход, 39/2к4"}, "fullAddress": {"new": "Россия, Краснодар, улица Западный Обход, 39/2к2", "old": "Россия, Краснодар, улица Западный Обход, 39/2к4"}}}	2025-06-18 13:21:35.227	update
cmc1zf8pm0009ky0486i7iq2i	cmc0forfn0009ld04zx62jqfa	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица Гидростроителей, 59/2", "old": "Краснодар, улица Гидростроителей, 59/2лит1"}, "fullAddress": {"new": "Россия, Краснодар, улица Гидростроителей, 59/2", "old": "Россия, Краснодар, улица Гидростроителей, 59/2лит1"}}}	2025-06-18 13:22:42.01	update
cmc1zh0di0003l104s7b4wn87	cmc0fhxzc0009l504lz60laxs	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени Снесарева, 10к1", "old": "Краснодар, улица имени Снесарева, 10к3"}, "fullAddress": {"new": "Россия, Краснодар, улица имени Снесарева, 10к1", "old": "Россия, Краснодар, улица имени Снесарева, 10к3"}}}	2025-06-18 13:24:04.519	update
cmc1zid3k0005l104vs1090oo	cmc0f369e0001ld04gwcm2kcz	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Калининский переулок, 26", "old": "Краснодар, Калининский переулок, 40"}, "fullAddress": {"new": "Россия, Краснодар, Калининский переулок, 26", "old": "Россия, Краснодар, Калининский переулок, 40"}}}	2025-06-18 13:25:07.664	update
cmc1zkcd3000fjp0andg5zkc3	cmc0evjtm0001l504z6uo7t2f	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени 40-летия Победы, 97/1", "old": "Краснодар, улица имени 40-летия Победы, 97/2"}, "fullAddress": {"new": "Россия, Краснодар, улица имени 40-летия Победы, 97/1", "old": "Россия, Краснодар, улица имени 40-летия Победы, 97/2"}}}	2025-06-18 13:26:40.023	update
cmc1zlosl000hjp0alyn4tnis	cmc0ei7px0009ie04tn1ihmvt	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени 40-летия Победы, 146/7", "old": "Краснодар, улица имени 40-летия Победы, 146/6к1"}, "fullAddress": {"new": "Россия, Краснодар, улица имени 40-летия Победы, 146/7", "old": "Россия, Краснодар, улица имени 40-летия Победы, 146/6к1"}}}	2025-06-18 13:27:42.789	update
cmc1zp2qo0007l104euq321a0	cmc0e0hns0001ie04xazcx1q5	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, микрорайон Юбилейный, проспект Чекистов, 38", "old": "Краснодар, микрорайон Юбилейный, проспект Чекистов, 40"}, "fullAddress": {"new": "Россия, Краснодар, микрорайон Юбилейный, проспект Чекистов, 38", "old": "Россия, Краснодар, микрорайон Юбилейный, проспект Чекистов, 40"}}}	2025-06-18 13:30:20.832	update
cmc1zq1ls0009l104tqkd0gaz	cmc0dqsng0001jp045rk6eltj	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, улица имени 40-летия Победы, 178к4", "old": "Краснодар, улица имени 40-летия Победы, 178к2"}, "fullAddress": {"new": "Россия, Краснодар, улица имени 40-летия Победы, 178к4", "old": "Россия, Краснодар, улица имени 40-летия Победы, 178к2"}}}	2025-06-18 13:31:06.016	update
cmc1zs5k2000bl1046m3ldn7f	cmbzfeu2m0001l404bz3gau95	cmah4r0390000n98ec1sazzvm	{"action": "update_fields", "fields": {"address": {"new": "Краснодар, Восточно-Кругликовская улица, 28/3", "old": "Краснодар, Восточно-Кругликовская улица, 22/3"}, "fullAddress": {"new": "Россия, Краснодар, Восточно-Кругликовская улица, 28/3", "old": "Россия, Краснодар, Восточно-Кругликовская улица, 22/3"}}}	2025-06-18 13:32:44.45	update
cmc3lcl3j0005n9qrx94paw1m	cmc3lcl3b0003n9qrb9ouwj99	cma2nicl30000jo04dsn1zx6i	{"data": {"floor": 32, "price": 503, "title": "3-комнатная квартира 34 м²", "cityId": "78f0ea79-e7cb-4b41-8ef5-1b8fc2ab7c74", "status": "active", "typeId": "d4d608d6-f69a-4030-bd5b-1d73dc243be2", "userId": "cma17p91m0000n94r28v2tbcr", "address": "Ea fugiat veniam au", "dealType": "RENT", "landArea": 62, "noShares": false, "condition": "Черновая", "houseArea": 34, "yearBuilt": 1988, "categoryId": "cma17xhoj0000n97c1me6gvu7", "districtId": "cmbw8gjn30008l5046qgvlagl", "balconyType": "BOTH", "kitchenArea": 55, "listingCode": "К-1432", "totalFloors": 65, "windowsView": "STREET", "adminComment": "Nisi autem enim dolo", "bathroomType": "COMBINED", "buildingType": "BRICK", "noEncumbrances": false, "publicDescription": "Aliquip ut consequat"}, "action": "create"}	2025-06-19 16:24:15.823	create
cmc3lclfb0009n9qra6ffh1s4	cmc3lcl3b0003n9qrb9ouwj99	cma2nicl30000jo04dsn1zx6i	{"added": [{"path": "/uploads/listings/4312af4f-1244-4bfd-9f3f-5bedea78a930.jpg", "size": "126KB", "filename": "apt.jpg"}]}	2025-06-19 16:24:16.247	images
\.


--
-- TOC entry 3776 (class 0 OID 26790)
-- Dependencies: 216
-- Data for Name: PropertyType; Type: TABLE DATA; Schema: public; Owner: postgres
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
-- TOC entry 3777 (class 0 OID 26795)
-- Dependencies: 217
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, username, password, phone, "createdAt", "updatedAt", photo) FROM stdin;
cma2nicl30000jo04dsn1zx6i	Ирина	irina	$2b$10$892viKMfU8oZcIAkHzL7Je.oB3obHAjpmyaP1kWqqTbgWAZ0bTh1K	+79624441579	2025-04-29 15:17:33.112	2025-04-29 15:17:33.112	
cmah4r0390000n98ec1sazzvm	Татьяна	dyvkovinka	$2b$10$B.GOSpwQQ164zaqoyiP74uAK4VW4a1mw3eVnNPIWD2NrewSJdoJum		2025-05-09 18:28:56.755	2025-05-09 18:28:56.755	
cma17p91m0000n94r28v2tbcr	Валерий Г.	valeriy	$2b$10$EnkjwGQ53gSWrKJ9EFA7Vue0NJSLlCrtRkgjsy55svWBqGenSLkV.	\N	2025-04-28 15:07:15.082	2025-06-05 17:42:10.132	\N
\.


--
-- TOC entry 3778 (class 0 OID 26801)
-- Dependencies: 218
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6b92b4f4-56d8-4f25-89b0-1fa215b02349	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-07 18:16:51.95183+03	20250607181619_make_property_type_optional		\N	2025-06-07 18:16:51.95183+03	0
bc0459db-71d7-42c1-8afc-dd0987a8c678	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-06-09 19:36:55.656276+03	20250414131013_init	\N	\N	2025-06-09 19:36:54.865644+03	1
2203f926-21a9-4a1a-b73b-a09eb241406e	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-05-02 20:38:43.300008+03	20250502173835_update_listing_fields	\N	\N	2025-05-02 20:38:42.380799+03	1
9e68d1bc-adb5-4396-8ebb-486a29b39c38	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-06-09 19:36:56.717516+03	20250414202255_rename_description	\N	\N	2025-06-09 19:36:55.955241+03	1
ed68603f-7ac0-49e0-9b8f-0e93e224702d	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-07 19:50:11.771279+03	20250610000000_add_city_model_and_field		\N	2025-06-07 19:50:11.771279+03	0
a14abf66-9760-4db5-8efd-88919cabb307	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-06-09 19:36:57.775956+03	20250420173452_add_user_photo	\N	\N	2025-06-09 19:36:57.022205+03	1
39a54acd-052e-4f26-965b-be862f1d3221	44be1fdc94dbe05522919c40dd9e8075b506fe9cf28806acaeb6e872368ea416	2025-05-10 16:46:11.379511+03	20250510134606_add_district_model	\N	\N	2025-05-10 16:46:10.919845+03	1
eb66f43a-f819-4bff-b620-a80c03547e64	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-06-09 19:36:58.83739+03	20250421193300_add_listing_edit_history	\N	\N	2025-06-09 19:36:58.077008+03	1
283f2755-41b2-486f-90ce-49989c6027fb	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-07 20:09:50.806849+03	20250620000000_make_city_optional		\N	2025-06-07 20:09:50.806849+03	0
f41cf16d-d96b-4339-96bb-1f6666847475	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-06-09 19:36:59.903853+03	20250421200226_add_listing_history	\N	\N	2025-06-09 19:36:59.14119+03	1
cdc13f63-b549-4cfb-aaea-ba133741b476	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	\N	20250510_manual_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510_manual_add_district_model\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "District" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"District\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1159), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225	2025-05-10 16:56:30.383282+03	2025-05-10 16:55:28.915369+03	0
8a03647c-049f-404f-8b2c-517b84b44c25	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-06-09 19:37:00.95622+03	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-06-09 19:37:00.205174+03	1
94b38ec3-2a62-42ac-94c7-7d57ded6a766	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-05-10 16:56:30.651235+03	20250510_manual_add_district_model		\N	2025-05-10 16:56:30.651235+03	0
59cab801-4af8-491b-a394-adfb257f4d9e	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-06-09 19:37:02.013675+03	20250502173835_update_listing_fields	\N	\N	2025-06-09 19:37:01.256865+03	1
a971b87f-6255-4997-b459-2212fb1f60cf	98777cb258344ebd3f939d592374734347e4aea7b5244a7d028b34761a064621	2025-06-09 19:37:03.087033+03	20250510_add_property_type_model	\N	\N	2025-06-09 19:37:02.313627+03	1
3136b34b-6b44-40fb-8e1b-f2dcaa112633	108bdb525b26edb330bac2c58b04ff0b265f2f202eae1998964ce7ce775bf529	2025-06-09 19:37:04.143091+03	20250510_fix_property_types	\N	\N	2025-06-09 19:37:03.385904+03	1
7f1e17ab-e644-4d6b-a090-36a18ea53818	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-06-09 19:37:05.210255+03	20250510_manual_add_district_model	\N	\N	2025-06-09 19:37:04.444851+03	1
3cc268eb-6466-4341-91ba-3168d3dfd0cc	d81500f21ed79be6dbac2d42f1682464f3d74d91711ca3af256707784f443cc3	\N	20250510134606_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510134606_add_district_model\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "districtId" of relation "Listing" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"districtId\\" of relation \\"Listing\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7478), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510134606_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510134606_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-09 19:37:41.626373+03	2025-06-09 19:37:05.510448+03	0
c86298d3-ea63-47d5-a9e0-83ea8d019529	d81500f21ed79be6dbac2d42f1682464f3d74d91711ca3af256707784f443cc3	2025-06-09 19:37:41.949987+03	20250510134606_add_district_model		\N	2025-06-09 19:37:41.949987+03	0
c041445d-a81a-4897-8ee6-7c2fd778e645	dda7fabbc5b70bb16b5a2350b7ea7f6c78f1e92834452d2162302edfc447e209	\N	undo_property_types	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: undo_property_types\n\nDatabase error code: 42501\n\nDatabase error:\nERROR: must be owner of table Listing\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42501), message: "must be owner of table Listing", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("aclchk.c"), line: Some(2981), routine: Some("aclcheck_error") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="undo_property_types"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="undo_property_types"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-10 17:07:38.537658+03	2025-05-17 01:22:34.277496+03	0
846ad8ae-08d6-4093-8065-45d20667aa83	9f109f53bfa5d3fcd1b3fa187664a696f0c2004bdbac037c6a7e24f6576b56c1	2025-06-09 19:38:45.075549+03	20250518212045_remove_rooms_field	\N	\N	2025-06-09 19:38:44.3215+03	1
9733a415-02e9-4913-9c74-09cf5b9c1aa1	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-06-09 19:38:46.131823+03	20250520000000_add_coordinates_to_listings	\N	\N	2025-06-09 19:38:45.377393+03	1
e99a3a94-d343-445a-bafa-ff4c84f729be	ead435c9d89b71dd29ef6939d3f775d794d47a4eaa76fda43700cba19aaaa1f6	2025-06-09 19:38:47.17906+03	20250520000000_make_district_optional	\N	\N	2025-06-09 19:38:46.429413+03	1
d686257d-fb04-4853-b1ca-57f5a133b5db	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-09 19:38:48.253868+03	20250607181619_make_property_type_optional	\N	\N	2025-06-09 19:38:47.49827+03	1
827a1ded-52a4-4d19-94cd-28792a756645	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-09 19:38:49.328152+03	20250610000000_add_city_model_and_field	\N	\N	2025-06-09 19:38:48.558731+03	1
961e283f-96ec-40ec-85e2-ce5a4497628d	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-09 19:38:50.386514+03	20250620000000_make_city_optional	\N	\N	2025-06-09 19:38:49.625416+03	1
5b3092de-db12-4d8f-8537-6f213c70597d	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-04-28 01:56:42.355668+03	20250414131013_init	\N	\N	2025-04-28 01:56:41.611757+03	1
489d6836-68bb-4750-b2d5-38c69ec87721	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-04-28 01:56:43.365843+03	20250414202255_rename_description	\N	\N	2025-04-28 01:56:42.644692+03	1
4838af72-cee9-4a8e-80d0-96833c932a10	ac165b61d6739ecbc3c2e11067894af95671f075718e1bca74fb02efd2fc51f4	2025-05-13 16:56:03.992701+03	20250510_add_property_type_model	\N	\N	2025-05-13 16:56:01.478285+03	1
1f260584-60cb-447a-8d45-a97d5ca6e3dd	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-04-28 01:56:44.400004+03	20250420173452_add_user_photo	\N	\N	2025-04-28 01:56:43.651371+03	1
47800b10-4356-402b-898c-6225b9ef1179	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-04-28 01:56:45.450622+03	20250421193300_add_listing_edit_history	\N	\N	2025-04-28 01:56:44.725302+03	1
e270b61d-42ee-45f9-89fc-020d9721ee82	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-04-28 01:56:46.458485+03	20250421200226_add_listing_history	\N	\N	2025-04-28 01:56:45.733836+03	1
7cfb3ebd-7dd0-42d7-b92e-3aba2ba31ad8	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-05-31 16:31:47.452815+03	20250520000000_add_coordinates_to_listings		\N	2025-05-31 16:31:47.452815+03	0
59459e44-be25-4af1-a33c-f4dadd545885	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-04-28 01:56:47.468463+03	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-04-28 01:56:46.745317+03	1
\.


--
-- TOC entry 3594 (class 2606 OID 26821)
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- TOC entry 3597 (class 2606 OID 26823)
-- Name: City City_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."City"
    ADD CONSTRAINT "City_pkey" PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 26825)
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- TOC entry 3602 (class 2606 OID 26827)
-- Name: District District_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."District"
    ADD CONSTRAINT "District_pkey" PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 26829)
-- Name: Image Image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_pkey" PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 26831)
-- Name: ListingHistory ListingHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_pkey" PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 26833)
-- Name: Listing Listing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_pkey" PRIMARY KEY (id);


--
-- TOC entry 3613 (class 2606 OID 26835)
-- Name: PropertyType PropertyType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyType"
    ADD CONSTRAINT "PropertyType_pkey" PRIMARY KEY (id);


--
-- TOC entry 3616 (class 2606 OID 26837)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3619 (class 2606 OID 26839)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 1259 OID 26840)
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- TOC entry 3598 (class 1259 OID 26841)
-- Name: City_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "City_slug_key" ON public."City" USING btree (slug);


--
-- TOC entry 3603 (class 1259 OID 26842)
-- Name: District_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "District_slug_key" ON public."District" USING btree (slug);


--
-- TOC entry 3606 (class 1259 OID 26843)
-- Name: Listing_listingCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Listing_listingCode_key" ON public."Listing" USING btree ("listingCode");


--
-- TOC entry 3609 (class 1259 OID 26844)
-- Name: Listing_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Listing_slug_key" ON public."Listing" USING btree (slug);


--
-- TOC entry 3614 (class 1259 OID 26845)
-- Name: PropertyType_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "PropertyType_slug_key" ON public."PropertyType" USING btree (slug);


--
-- TOC entry 3617 (class 1259 OID 26846)
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- TOC entry 3620 (class 2606 OID 26847)
-- Name: Comment Comment_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3621 (class 2606 OID 26852)
-- Name: Image Image_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Image"
    ADD CONSTRAINT "Image_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3627 (class 2606 OID 26857)
-- Name: ListingHistory ListingHistory_listingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES public."Listing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3628 (class 2606 OID 26862)
-- Name: ListingHistory ListingHistory_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ListingHistory"
    ADD CONSTRAINT "ListingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3622 (class 2606 OID 26867)
-- Name: Listing Listing_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3623 (class 2606 OID 26872)
-- Name: Listing Listing_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public."City"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3624 (class 2606 OID 26877)
-- Name: Listing Listing_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public."District"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3625 (class 2606 OID 26882)
-- Name: Listing Listing_typeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."PropertyType"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3626 (class 2606 OID 26887)
-- Name: Listing Listing_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Listing"
    ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3629 (class 2606 OID 26892)
-- Name: PropertyType PropertyType_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PropertyType"
    ADD CONSTRAINT "PropertyType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3786 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: test_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;


--
-- TOC entry 3787 (class 0 OID 0)
-- Dependencies: 209
-- Name: TABLE "Category"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."Category" TO test_user;


--
-- TOC entry 3788 (class 0 OID 0)
-- Dependencies: 210
-- Name: TABLE "City"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."City" TO test_user;


--
-- TOC entry 3789 (class 0 OID 0)
-- Dependencies: 211
-- Name: TABLE "Comment"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."Comment" TO test_user;


--
-- TOC entry 3790 (class 0 OID 0)
-- Dependencies: 212
-- Name: TABLE "District"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."District" TO test_user;


--
-- TOC entry 3791 (class 0 OID 0)
-- Dependencies: 213
-- Name: TABLE "Image"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."Image" TO test_user;


--
-- TOC entry 3792 (class 0 OID 0)
-- Dependencies: 214
-- Name: TABLE "Listing"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."Listing" TO test_user;


--
-- TOC entry 3793 (class 0 OID 0)
-- Dependencies: 215
-- Name: TABLE "ListingHistory"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."ListingHistory" TO test_user;


--
-- TOC entry 3794 (class 0 OID 0)
-- Dependencies: 216
-- Name: TABLE "PropertyType"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."PropertyType" TO test_user;


--
-- TOC entry 3795 (class 0 OID 0)
-- Dependencies: 217
-- Name: TABLE "User"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public."User" TO test_user;


--
-- TOC entry 3796 (class 0 OID 0)
-- Dependencies: 218
-- Name: TABLE _prisma_migrations; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE public._prisma_migrations TO test_user;


--
-- TOC entry 2075 (class 826 OID 26897)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 2076 (class 826 OID 26898)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-06-25 13:04:49 MSK

--
-- PostgreSQL database dump complete
--

