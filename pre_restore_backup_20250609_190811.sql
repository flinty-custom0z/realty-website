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
-- Name: public; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO neondb_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: neondb_owner
--

COMMENT ON SCHEMA public IS '';


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
    "categoryId" text NOT NULL,
    "userId" text NOT NULL,
    district text,
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
    title text DEFAULT ''::text NOT NULL,
    latitude double precision,
    longitude double precision,
    "fullAddress" text,
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
    "categoryId" text NOT NULL,
    count integer
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
ba0d66b5-31a7-40bc-9ada-65f7c2fbaff4	Краснодар	krasnodar
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
\.


--
-- Data for Name: Listing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."Listing" (id, "categoryId", "userId", district, address, "houseArea", "landArea", floor, "totalFloors", condition, "yearBuilt", "noEncumbrances", price, currency, "dateAdded", "listingCode", status, "adminComment", "publicDescription", "dealType", "balconyType", "bathroomType", "buildingType", "kitchenArea", "noShares", "windowsView", "typeId", "districtId", title, latitude, longitude, "fullAddress", "cityId") FROM stdin;
\.


--
-- Data for Name: ListingHistory; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."ListingHistory" (id, "listingId", "userId", changes, "createdAt", action) FROM stdin;
\.


--
-- Data for Name: PropertyType; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public."PropertyType" (id, name, slug, "categoryId", count) FROM stdin;
6bec98df-22c4-4d2f-9c10-fc9a3fe3fe98	Студия	studio	cma17xhoj0000n97c1me6gvu7	\N
559c2a97-40b4-4fcc-80be-618c18f07f55	1-комнатная квартира	1-room	cma17xhoj0000n97c1me6gvu7	\N
a359a2cd-42c3-4f24-83e0-1432618b988e	2-комнатная квартира	2-room	cma17xhoj0000n97c1me6gvu7	\N
d4d608d6-f69a-4030-bd5b-1d73dc243be2	3-комнатная квартира	3-room	cma17xhoj0000n97c1me6gvu7	\N
3a40a5de-8b28-4090-a653-c66e37fbffcd	4-комнатная квартира	4-room	cma17xhoj0000n97c1me6gvu7	\N
93cabc7d-d443-4de2-9382-aaf23e8f9def	5-комнатная квартира	5-room	cma17xhoj0000n97c1me6gvu7	\N
1c955b48-aae6-4f75-b305-0f0461b91d4e	Пентхаус	penthouse	cma17xhoj0000n97c1me6gvu7	\N
e24fb443-4ce4-4ba2-b64f-70aee9aadfd5	Таунхаус	townhouse	cma17xip50001n97czf8u3mhm	\N
c79f858c-094e-4e35-a3e5-1236be2adede	Часть дома	house-part	cma17xip50001n97czf8u3mhm	\N
4eb460b3-0cd1-4791-90b1-b72f9dc9b073	Дуплекс	duplex	cma17xip50001n97czf8u3mhm	\N
9a2bc74e-2608-4e52-b948-da97c87c6446	Дача	cottage	cma17xip50001n97czf8u3mhm	\N
8262d3c9-20c2-49ac-b6b5-4773435755cf	Торговая площадь	retail	cma17xo0z0003n97c87a2l7nj	\N
d96d9e2f-9750-4a09-ad92-e4dff9e356e3	Коммерческая земля	commercial-land	cma17xo0z0003n97c87a2l7nj	\N
ef9ff24a-852f-4f53-a555-e190886aa646	Офис	office	cma17xo0z0003n97c87a2l7nj	\N
c71104e9-ee28-415a-b404-5bf2f455a1b8	Бизнес	business	cma17xo0z0003n97c87a2l7nj	\N
8d8d859c-f875-4c77-9341-f9c99eec0b97	Склад	warehouse	cma17xo0z0003n97c87a2l7nj	\N
308a142b-ff78-47ae-afbc-7eb023adf0f6	Участок	plot	cma17xja10002n97clar7xzll	\N
0c80c2b7-7e00-4b39-81b1-e860bf2abf35	Под ИЖС	ihs	cma17xja10002n97clar7xzll	\N
aa999b05-daa9-403e-a1e1-d461db4a15c7	Садоводство	gardening	cma17xja10002n97clar7xzll	\N
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
6b92b4f4-56d8-4f25-89b0-1fa215b02349	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-07 15:16:51.95183+00	20250607181619_make_property_type_optional		\N	2025-06-07 15:16:51.95183+00	0
1fae2ed7-91dc-4919-9b5c-208e73c05b2b	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-06-09 15:53:32.865014+00	20250414131013_init	\N	\N	2025-06-09 15:53:32.021124+00	1
2203f926-21a9-4a1a-b73b-a09eb241406e	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-05-02 17:38:43.300008+00	20250502173835_update_listing_fields	\N	\N	2025-05-02 17:38:42.380799+00	1
18aaab7c-25af-4c17-abfc-5f0958964106	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-06-09 15:53:33.927718+00	20250414202255_rename_description	\N	\N	2025-06-09 15:53:33.164068+00	1
ed68603f-7ac0-49e0-9b8f-0e93e224702d	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-07 16:50:11.771279+00	20250610000000_add_city_model_and_field		\N	2025-06-07 16:50:11.771279+00	0
c2d93e77-04b9-485b-ad21-b5bf3588660f	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-06-09 15:53:34.991498+00	20250420173452_add_user_photo	\N	\N	2025-06-09 15:53:34.228057+00	1
39a54acd-052e-4f26-965b-be862f1d3221	44be1fdc94dbe05522919c40dd9e8075b506fe9cf28806acaeb6e872368ea416	2025-05-10 13:46:11.379511+00	20250510134606_add_district_model	\N	\N	2025-05-10 13:46:10.919845+00	1
86a469fe-daca-4b31-828c-6c2500bf72af	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-06-09 15:53:36.06633+00	20250421193300_add_listing_edit_history	\N	\N	2025-06-09 15:53:35.293808+00	1
283f2755-41b2-486f-90ce-49989c6027fb	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-07 17:09:50.806849+00	20250620000000_make_city_optional		\N	2025-06-07 17:09:50.806849+00	0
cb809c55-c90a-4a6d-8ff0-ae3e993a4fa3	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-06-09 15:53:37.126431+00	20250421200226_add_listing_history	\N	\N	2025-06-09 15:53:36.365711+00	1
cdc13f63-b549-4cfb-aaea-ba133741b476	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	\N	20250510_manual_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510_manual_add_district_model\n\nDatabase error code: 42P07\n\nDatabase error:\nERROR: relation "District" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42P07), message: "relation \\"District\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("heap.c"), line: Some(1159), routine: Some("heap_create_with_catalog") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510_manual_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:225	2025-05-10 13:56:30.383282+00	2025-05-10 13:55:28.915369+00	0
9f3f7566-4f12-4c89-bca9-64f91b52cf55	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-06-09 15:53:38.189125+00	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-06-09 15:53:37.426992+00	1
94b38ec3-2a62-42ac-94c7-7d57ded6a766	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-05-10 13:56:30.651235+00	20250510_manual_add_district_model		\N	2025-05-10 13:56:30.651235+00	0
e82db4f1-a964-4969-9357-ea50981c56f6	1c7c2762e2a6f0d3084df1a2eab659c1e184fada8c01ac5fa8ec7fc7f97e9820	2025-06-09 15:53:39.245356+00	20250502173835_update_listing_fields	\N	\N	2025-06-09 15:53:38.490535+00	1
08224fb4-7b93-4490-8437-b52afe05bc84	98777cb258344ebd3f939d592374734347e4aea7b5244a7d028b34761a064621	2025-06-09 15:53:40.343138+00	20250510_add_property_type_model	\N	\N	2025-06-09 15:53:39.560784+00	1
d309decb-2895-4f55-8ba1-52ee908b636d	108bdb525b26edb330bac2c58b04ff0b265f2f202eae1998964ce7ce775bf529	2025-06-09 15:53:41.395593+00	20250510_fix_property_types	\N	\N	2025-06-09 15:53:40.643841+00	1
b9e40757-a0ec-4a4f-8c3b-b051279485e8	4152f3ac86e959598bb42765afd6ca17dfe277f56e814d6b6e09acfda4bf15ee	2025-06-09 15:53:42.472663+00	20250510_manual_add_district_model	\N	\N	2025-06-09 15:53:41.699522+00	1
e5a81dd8-0f94-4853-803a-44b4d1edfb95	d81500f21ed79be6dbac2d42f1682464f3d74d91711ca3af256707784f443cc3	\N	20250510134606_add_district_model	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250510134606_add_district_model\n\nDatabase error code: 42701\n\nDatabase error:\nERROR: column "districtId" of relation "Listing" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42701), message: "column \\"districtId\\" of relation \\"Listing\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("tablecmds.c"), line: Some(7478), routine: Some("check_for_column_name_collision") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250510134606_add_district_model"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250510134606_add_district_model"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	2025-06-09 15:54:43.859464+00	2025-06-09 15:53:42.772955+00	0
9d9b3fac-9eaf-4dc0-b832-8eda0b1efd9a	d81500f21ed79be6dbac2d42f1682464f3d74d91711ca3af256707784f443cc3	2025-06-09 15:54:44.169026+00	20250510134606_add_district_model		\N	2025-06-09 15:54:44.169026+00	0
29346fb3-c64c-4385-a1a7-eb947d47bfa4	9f109f53bfa5d3fcd1b3fa187664a696f0c2004bdbac037c6a7e24f6576b56c1	2025-06-09 15:55:55.598449+00	20250518212045_remove_rooms_field	\N	\N	2025-06-09 15:55:54.83077+00	1
dec362e1-5e9f-4128-87de-6500340ddd03	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-06-09 15:55:56.675867+00	20250520000000_add_coordinates_to_listings	\N	\N	2025-06-09 15:55:55.905476+00	1
db2c539d-f4d2-46bf-b940-58f851c7d208	ead435c9d89b71dd29ef6939d3f775d794d47a4eaa76fda43700cba19aaaa1f6	2025-06-09 15:55:57.735489+00	20250520000000_make_district_optional	\N	\N	2025-06-09 15:55:56.977028+00	1
d0cf31fc-a30f-4729-91e5-e0c5d98aff02	82c8c7124d89e4c65c38c554f179ea9338c8b31d99618519557682175cca305f	2025-06-09 15:55:58.803632+00	20250607181619_make_property_type_optional	\N	\N	2025-06-09 15:55:58.04013+00	1
d055531e-bda1-4270-8ec6-2e57456dbb77	7258afde164c4facb5d8ccd0b15af674ca05b8b02166b3fe5c5d6240444f7e75	2025-06-09 15:55:59.885062+00	20250610000000_add_city_model_and_field	\N	\N	2025-06-09 15:55:59.105375+00	1
072f1aa9-368f-49ec-a380-cd673561e8c8	cbd2b54aedd05b4ae1589a44eb046451639f47e38e3e0b0a27431627c069bb57	2025-06-09 15:56:00.946375+00	20250620000000_make_city_optional	\N	\N	2025-06-09 15:56:00.186176+00	1
5b3092de-db12-4d8f-8537-6f213c70597d	9885880627d1218ad98dda67018916f7d310de053408ac4d1f56618ac74eaf0d	2025-04-27 22:56:42.355668+00	20250414131013_init	\N	\N	2025-04-27 22:56:41.611757+00	1
489d6836-68bb-4750-b2d5-38c69ec87721	b02bb9ce263b6a823da27e749b8368f0bcc0877a2a5f89540a045c7a8759b052	2025-04-27 22:56:43.365843+00	20250414202255_rename_description	\N	\N	2025-04-27 22:56:42.644692+00	1
4838af72-cee9-4a8e-80d0-96833c932a10	ac165b61d6739ecbc3c2e11067894af95671f075718e1bca74fb02efd2fc51f4	2025-05-13 13:56:03.992701+00	20250510_add_property_type_model	\N	\N	2025-05-13 13:56:01.478285+00	1
1f260584-60cb-447a-8d45-a97d5ca6e3dd	5b22e609af593018b695cb6683baeb296ed80001187d34223466b506510160d7	2025-04-27 22:56:44.400004+00	20250420173452_add_user_photo	\N	\N	2025-04-27 22:56:43.651371+00	1
47800b10-4356-402b-898c-6225b9ef1179	418ea01c823a94788f15929413333b7baf4c01e37dbd7373378bbf19eafb9087	2025-04-27 22:56:45.450622+00	20250421193300_add_listing_edit_history	\N	\N	2025-04-27 22:56:44.725302+00	1
c041445d-a81a-4897-8ee6-7c2fd778e645	dda7fabbc5b70bb16b5a2350b7ea7f6c78f1e92834452d2162302edfc447e209	\N	undo_property_types	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: undo_property_types\n\nDatabase error code: 42501\n\nDatabase error:\nERROR: must be owner of table Listing\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42501), message: "must be owner of table Listing", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("aclchk.c"), line: Some(2981), routine: Some("aclcheck_error") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="undo_property_types"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="undo_property_types"\n             at schema-engine/commands/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:231	\N	2025-05-16 22:22:34.277496+00	0
e270b61d-42ee-45f9-89fc-020d9721ee82	19c310e1e29187a56b7d5f6e3dc2d8ada8648d690a2c5c9f90ce1626db98d5ae	2025-04-27 22:56:46.458485+00	20250421200226_add_listing_history	\N	\N	2025-04-27 22:56:45.733836+00	1
7cfb3ebd-7dd0-42d7-b92e-3aba2ba31ad8	59ad375b28d2fb0d0e9e994b551d0423a6426e1239708c9defc34d75900a11f0	2025-05-31 13:31:47.452815+00	20250520000000_add_coordinates_to_listings		\N	2025-05-31 13:31:47.452815+00	0
59459e44-be25-4af1-a33c-f4dadd545885	bb94249f71ab6f6f6f50f27ebcb88a98a815ac074ce8f0ca516ca17c3fa0915a	2025-04-27 22:56:47.468463+00	20250424172307_add_deal_type_remove_industrial	\N	\N	2025-04-27 22:56:46.745317+00	1
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
    ADD CONSTRAINT "Listing_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES public."PropertyType"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: neondb_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

