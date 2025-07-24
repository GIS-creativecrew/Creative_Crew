--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bu_husky_ids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bu_husky_ids (
    assignment_id integer NOT NULL,
    husky_id character varying(50) NOT NULL,
    assigned_by character varying(50),
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bu_id integer
);


ALTER TABLE public.bu_husky_ids OWNER TO postgres;

--
-- Name: bu_assignments_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bu_assignments_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bu_assignments_assignment_id_seq OWNER TO postgres;

--
-- Name: bu_assignments_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bu_assignments_assignment_id_seq OWNED BY public.bu_husky_ids.assignment_id;


--
-- Name: business_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_units (
    id integer NOT NULL,
    name character varying(200)
);


ALTER TABLE public.business_units OWNER TO postgres;

--
-- Name: candidate_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_info (
    candidate_token character varying(7) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email_id character varying(150) NOT NULL,
    phone_number character varying(20) NOT NULL,
    applied_position character varying(100),
    attendance_marked boolean DEFAULT false,
    attendance_marked_at timestamp without time zone,
    email_sent boolean DEFAULT false
);


ALTER TABLE public.candidate_info OWNER TO postgres;

--
-- Name: drive_husky_ids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drive_husky_ids (
    id integer NOT NULL,
    husky_id character varying(50) NOT NULL,
    drive_id integer NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.drive_husky_ids OWNER TO postgres;

--
-- Name: drive_husky_ids_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drive_husky_ids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drive_husky_ids_id_seq OWNER TO postgres;

--
-- Name: drive_husky_ids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drive_husky_ids_id_seq OWNED BY public.drive_husky_ids.id;


--
-- Name: drives; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drives (
    drive_id integer NOT NULL,
    drive_name character varying(200) NOT NULL,
    drive_date date NOT NULL,
    bu_id integer,
    mode_of_interview character varying(50) NOT NULL,
    country character varying(50),
    state character varying(50),
    city character varying(50),
    building character varying(50),
    drive_details text,
    no_of_openings integer NOT NULL,
    no_of_panel_rounds integer NOT NULL,
    created_by character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    time_slot character varying(50)
);


ALTER TABLE public.drives OWNER TO postgres;

--
-- Name: drives_drive_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drives_drive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drives_drive_id_seq OWNER TO postgres;

--
-- Name: drives_drive_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drives_drive_id_seq OWNED BY public.drives.drive_id;


--
-- Name: employee_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_info (
    employee_id character varying(50) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    office_email_id character varying(150) NOT NULL,
    role character varying(20) NOT NULL,
    password character varying(255) NOT NULL,
    bu_id integer,
    CONSTRAINT employee_id_numeric CHECK (((employee_id)::text ~ '^\d{1,7}$'::text)),
    CONSTRAINT employee_info_role_check CHECK (((role)::text = ANY ((ARRAY['Colleague'::character varying, 'TA Lead'::character varying, 'TA'::character varying])::text[])))
);


ALTER TABLE public.employee_info OWNER TO postgres;

--
-- Name: interview_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_feedback (
    id integer NOT NULL,
    candidate_token character varying(7),
    interviewer_id character varying(50),
    time_slot timestamp without time zone,
    room_no character varying(50),
    status character varying(50),
    feedback_status text,
    sent_to_ta boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    interview_level character varying(50),
    candidate_status character varying(50)
);


ALTER TABLE public.interview_feedback OWNER TO postgres;

--
-- Name: interview_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interview_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interview_feedback_id_seq OWNER TO postgres;

--
-- Name: interview_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interview_feedback_id_seq OWNED BY public.interview_feedback.id;


--
-- Name: interview_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_rooms (
    id integer NOT NULL,
    office character varying(250),
    floor integer,
    meeting_room_number character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interview_rooms OWNER TO postgres;

--
-- Name: interview_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_schedule (
    id integer NOT NULL,
    candidate_token character varying(7),
    interview_level character varying(50) NOT NULL,
    panel_id integer,
    room_id integer,
    scheduled_time timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'Scheduled'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    result character varying(20) DEFAULT NULL::character varying,
    drive_id integer,
    feedback_from_candidate text
);


ALTER TABLE public.interview_schedule OWNER TO postgres;

--
-- Name: interview_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interview_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interview_schedule_id_seq OWNER TO postgres;

--
-- Name: interview_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interview_schedule_id_seq OWNED BY public.interview_schedule.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    candidate_token character varying(7),
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read boolean DEFAULT false
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: panels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.panels (
    id integer NOT NULL,
    panel_name character varying(700) NOT NULL,
    interview_level character varying(50),
    panel_members text,
    interview_room_id integer,
    drive_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.panels OWNER TO postgres;

--
-- Name: panels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.panels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.panels_id_seq OWNER TO postgres;

--
-- Name: panels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.panels_id_seq OWNED BY public.panels.id;


--
-- Name: bu_husky_ids assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bu_husky_ids ALTER COLUMN assignment_id SET DEFAULT nextval('public.bu_assignments_assignment_id_seq'::regclass);


--
-- Name: drive_husky_ids id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_husky_ids ALTER COLUMN id SET DEFAULT nextval('public.drive_husky_ids_id_seq'::regclass);


--
-- Name: drives drive_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drives ALTER COLUMN drive_id SET DEFAULT nextval('public.drives_drive_id_seq'::regclass);


--
-- Name: interview_feedback id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_feedback ALTER COLUMN id SET DEFAULT nextval('public.interview_feedback_id_seq'::regclass);


--
-- Name: interview_schedule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_schedule ALTER COLUMN id SET DEFAULT nextval('public.interview_schedule_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: panels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.panels ALTER COLUMN id SET DEFAULT nextval('public.panels_id_seq'::regclass);


--
-- Data for Name: bu_husky_ids; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bu_husky_ids (assignment_id, husky_id, assigned_by, assigned_at, bu_id) FROM stdin;
1	HUSKY-GIS-001	5611234	2025-07-19 15:18:59.582381	3
2	HUSKY-GIS-002	5611234	2025-07-19 15:18:59.590546	3
3	HUSKY-GIS-003	5611234	2025-07-19 15:18:59.59191	3
\.


--
-- Data for Name: business_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_units (id, name) FROM stdin;
1	Customer Relationship
2	Consumer Lending
3	GIS
4	IP&I
5	P&P
\.


--
-- Data for Name: candidate_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_info (candidate_token, first_name, last_name, email_id, phone_number, applied_position, attendance_marked, attendance_marked_at, email_sent) FROM stdin;
1KUHFOQ	Manvitha	Salla	salla.manvitha@gmail.com	1234567890	cloud engineer	f	\N	f
RTA2kO3	Shreya	Nerkar	shreyafeb18@gmail.com	7447644864	cloud Engineer	f	\N	f
I4xLAjA	Supriya	Dharavath	dharavathsupriya510@gmail.com	1221344356	cloud Engineer	f	\N	f
Pmz7lNP	Aishwarya	rao	msaishwaryarao545@gmail.com	9876543201	cloud engineer	t	2025-07-23 10:06:25.651035	f
\.


--
-- Data for Name: drive_husky_ids; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drive_husky_ids (id, husky_id, drive_id, status, assigned_at) FROM stdin;
1	HUSKY-GIS-001	1	available	2025-07-19 15:28:52.707139
2	HUSKY-GIS-002	1	available	2025-07-19 15:28:52.710683
3	HUSKY-GIS-003	1	available	2025-07-19 15:28:52.711737
\.


--
-- Data for Name: drives; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drives (drive_id, drive_name, drive_date, bu_id, mode_of_interview, country, state, city, building, drive_details, no_of_openings, no_of_panel_rounds, created_by, created_at, time_slot) FROM stdin;
1	GIS	2025-07-19	3	Physical	India	Telangana	Hyderabad	Knowledge Park		3	3	5611028	2025-07-19 15:28:52.694143	11am to 9pm
\.


--
-- Data for Name: employee_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee_info (employee_id, first_name, last_name, office_email_id, role, password, bu_id) FROM stdin;
5611028	Shreya	Nerkar	shreya.n@company.com	TA	$2b$10$3QNyiRqzqK7Hvrk0OPLENepD/0GJEV6yRN0YuJqSzyIW.a6mL/Bna	3
5611234	Balaji	T	balaji.t@company.com	TA Lead	$2b$10$nb.dcK76UlpuFNTdwaRh7uwF/VwC258YJl1sAwbW9YaGWmL9eL29u	3
5611101	Kapil	Patil	kapil.p@company.com	Colleague	$2b$10$wEtN0LIqqCyjDg9mEIVciOhkuiAWsUdP5AN3Myyt4tLPD1gxzeRw6	3
5611102	Sakshi	Mundada	sakshi.m@company.com	Colleague	$2b$10$s247WQXOhACevkP45/r/VeElKXGoyapVxSTpnFD2CphaRH/sq/0fC	3
5611103	Vishal	Krishnan	vishal.k@company.com	Colleague	$2b$10$x6DCnMxYjW9E78woh5oa/uDRhFOUz1bH0k7C5P6VDbzNPm/JyHr4O	3
5611104	Nipun	Seeram	nipun.s@company.com	Colleague	$2b$10$7tyMZkbLGfU4oFYAM/ASVuIwKm34IvwuWOOJlnsuTUOAcr2YZY46i	3
\.


--
-- Data for Name: interview_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_feedback (id, candidate_token, interviewer_id, time_slot, room_no, status, feedback_status, sent_to_ta, created_at, interview_level, candidate_status) FROM stdin;
8	Pmz7lNP	5611103	2025-07-23 05:30:00	Room303	Finished	good	t	2025-07-23 00:13:46.126496	L1	Selected
9	Pmz7lNP	5611103	2025-07-23 05:30:00	Room303	Finished	good	t	2025-07-23 10:06:18.493794	L1	Selected
\.


--
-- Data for Name: interview_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_rooms (id, office, floor, meeting_room_number, created_at) FROM stdin;
1	Pune	1	Room101	2025-07-17 09:00:00
2	Bangalore	2	Room202	2025-07-17 09:10:00
3	Hyderabad	3	Room303	2025-07-17 09:20:00
4	Delhi	4	Room404	2025-07-17 09:30:00
5	Mumbai	5	Room505	2025-07-17 09:40:00
\.


--
-- Data for Name: interview_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_schedule (id, candidate_token, interview_level, panel_id, room_id, scheduled_time, status, created_at, result, drive_id, feedback_from_candidate) FROM stdin;
4	Pmz7lNP	L1	1	3	2025-07-23 11:00:00	Finished	2025-07-22 23:59:35.63829	Selected	1	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, candidate_token, message, created_at, read) FROM stdin;
\.


--
-- Data for Name: panels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.panels (id, panel_name, interview_level, panel_members, interview_room_id, drive_id, created_at) FROM stdin;
1	Vishal Krishnan - Sakshi Mundada	L1	["5611103","5611102"]	3	1	2025-07-22 15:07:50.336697
2	Nipun Seeram - Kapil Patil	L2	["5611104","5611101"]	5	1	2025-07-22 15:08:12.622685
\.


--
-- Name: bu_assignments_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bu_assignments_assignment_id_seq', 3, true);


--
-- Name: drive_husky_ids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drive_husky_ids_id_seq', 3, true);


--
-- Name: drives_drive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drives_drive_id_seq', 1, true);


--
-- Name: interview_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interview_feedback_id_seq', 9, true);


--
-- Name: interview_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interview_schedule_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 4, true);


--
-- Name: panels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.panels_id_seq', 2, true);


--
-- Name: bu_husky_ids bu_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bu_husky_ids
    ADD CONSTRAINT bu_assignments_pkey PRIMARY KEY (assignment_id);


--
-- Name: business_units business_units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_units
    ADD CONSTRAINT business_units_pkey PRIMARY KEY (id);


--
-- Name: candidate_info candidate_info_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_info
    ADD CONSTRAINT candidate_info_email_id_key UNIQUE (email_id);


--
-- Name: candidate_info candidate_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_info
    ADD CONSTRAINT candidate_info_pkey PRIMARY KEY (candidate_token);


--
-- Name: drive_husky_ids drive_husky_ids_husky_id_drive_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_husky_ids
    ADD CONSTRAINT drive_husky_ids_husky_id_drive_id_key UNIQUE (husky_id, drive_id);


--
-- Name: drive_husky_ids drive_husky_ids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_husky_ids
    ADD CONSTRAINT drive_husky_ids_pkey PRIMARY KEY (id);


--
-- Name: drives drives_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drives
    ADD CONSTRAINT drives_pkey PRIMARY KEY (drive_id);


--
-- Name: employee_info employee_info_office_email_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_info
    ADD CONSTRAINT employee_info_office_email_id_key UNIQUE (office_email_id);


--
-- Name: employee_info employee_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_info
    ADD CONSTRAINT employee_info_pkey PRIMARY KEY (employee_id);


--
-- Name: interview_feedback interview_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_feedback
    ADD CONSTRAINT interview_feedback_pkey PRIMARY KEY (id);


--
-- Name: interview_rooms interview_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_rooms
    ADD CONSTRAINT interview_rooms_pkey PRIMARY KEY (id);


--
-- Name: interview_schedule interview_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_schedule
    ADD CONSTRAINT interview_schedule_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: panels panels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.panels
    ADD CONSTRAINT panels_pkey PRIMARY KEY (id);


--
-- Name: bu_husky_ids bu_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bu_husky_ids
    ADD CONSTRAINT bu_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.employee_info(employee_id);


--
-- Name: drive_husky_ids drive_husky_ids_drive_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drive_husky_ids
    ADD CONSTRAINT drive_husky_ids_drive_id_fkey FOREIGN KEY (drive_id) REFERENCES public.drives(drive_id);


--
-- Name: drives drives_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drives
    ADD CONSTRAINT drives_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.employee_info(employee_id);


--
-- Name: bu_husky_ids fk_bu_husky_bu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bu_husky_ids
    ADD CONSTRAINT fk_bu_husky_bu FOREIGN KEY (bu_id) REFERENCES public.business_units(id);


--
-- Name: employee_info fk_employee_bu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_info
    ADD CONSTRAINT fk_employee_bu FOREIGN KEY (bu_id) REFERENCES public.business_units(id);


--
-- Name: interview_feedback interview_feedback_candidate_token_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_feedback
    ADD CONSTRAINT interview_feedback_candidate_token_fkey FOREIGN KEY (candidate_token) REFERENCES public.candidate_info(candidate_token);


--
-- Name: interview_feedback interview_feedback_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_feedback
    ADD CONSTRAINT interview_feedback_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.employee_info(employee_id);


--
-- Name: interview_schedule interview_schedule_candidate_token_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_schedule
    ADD CONSTRAINT interview_schedule_candidate_token_fkey FOREIGN KEY (candidate_token) REFERENCES public.candidate_info(candidate_token);


--
-- Name: interview_schedule interview_schedule_panel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_schedule
    ADD CONSTRAINT interview_schedule_panel_id_fkey FOREIGN KEY (panel_id) REFERENCES public.panels(id);


--
-- Name: interview_schedule interview_schedule_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_schedule
    ADD CONSTRAINT interview_schedule_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.interview_rooms(id);


--
-- Name: notifications notifications_candidate_token_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_candidate_token_fkey FOREIGN KEY (candidate_token) REFERENCES public.candidate_info(candidate_token);


--
-- Name: panels panels_drive_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.panels
    ADD CONSTRAINT panels_drive_id_fkey FOREIGN KEY (drive_id) REFERENCES public.drives(drive_id);


--
-- Name: panels panels_interview_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.panels
    ADD CONSTRAINT panels_interview_room_id_fkey FOREIGN KEY (interview_room_id) REFERENCES public.interview_rooms(id);


--
-- PostgreSQL database dump complete
--
