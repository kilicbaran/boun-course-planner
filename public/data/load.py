#!/usr/bin/env python3
"""
BOUN Course Planner - Veri Yukleyici (load.py)
Bogazici Universitesi'nin kayit sisteminden ders programini ceker ve JSON'a kaydeder.

Kullanim:
    python load.py                  # En son donemi otomatik cek
    python load.py 2026/2027-1      # Belirli bir donemi cek
"""

import json
import os
import sys
import time
import re
import requests
from bs4 import BeautifulSoup

BASE_URL = "https://registration.bogazici.edu.tr"
SCHEDULE_PAGE = f"{BASE_URL}/BUIS/General/schedule.aspx?p=semester"
DATA_DIR = os.path.dirname(os.path.abspath(__file__))


def parse_days(days_str):
    """
    Gun string'ini liste olarak ayristir.
    Ornekler:
      'MMT'  -> ['M','M','T']
      'ThTh' -> ['Th','Th']
      'MThF' -> ['M','Th','F']
      'StSt' -> ['St','St']
    """
    days = []
    i = 0
    s = days_str.strip()
    while i < len(s):
        two = s[i:i+2]
        if two in ("Th", "St", "TH", "ST"):
            days.append("Th" if two in ("Th", "TH") else "St")
            i += 2
        else:
            c = s[i]
            if c in ("M", "T", "W", "F"):
                days.append(c)
            i += 1
    return days


def parse_hours(hours_str):
    """
    Saat string'ini parse et.
    BOUN tek haneli saat kullanir: '128' -> [1, 2, 8]
    """
    h = hours_str.strip()
    if not h:
        return []
    if " " in h:
        result = []
        for part in h.split():
            try:
                result.append(int(part))
            except ValueError:
                pass
        return result
    result = []
    for c in h:
        if c.isdigit():
            result.append(int(c))
    return result


def get_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    })
    return session


def get_available_semesters(session):
    """Mevcut donemleri web sitesinden cek."""
    print("Mevcut donemler aliniyor...")
    r = session.get(SCHEDULE_PAGE, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    select = soup.find("select", {"id": "ctl00_cphMainContent_ddlSemester"})
    if not select:
        raise ValueError("Donem secici bulunamadi!")
    return [opt["value"] for opt in select.find_all("option")]


def get_departments(session, semester):
    """Bir donem icin bolum listesini ve URL'lerini cek."""
    print(f"Bolumler aliniyor: {semester}")

    r = session.get(SCHEDULE_PAGE, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    viewstate = soup.find("input", {"id": "__VIEWSTATE"})["value"]
    vsg_el = soup.find("input", {"id": "__VIEWSTATEGENERATOR"})
    ev_el = soup.find("input", {"id": "__EVENTVALIDATION"})

    post_data = {
        "__VIEWSTATE": viewstate,
        "__VIEWSTATEGENERATOR": vsg_el["value"] if vsg_el else "",
        "__EVENTVALIDATION": ev_el["value"] if ev_el else "",
        "ctl00$cphMainContent$ddlSemester": semester,
        "ctl00$cphMainContent$btnSearch": "Go",
        "ctl00$cphMainContent$gRecResp": "dummy_token",
    }

    r2 = session.post(
        SCHEDULE_PAGE,
        data=post_data,
        timeout=60,
        headers={"Referer": SCHEDULE_PAGE, "Origin": BASE_URL},
    )
    r2.raise_for_status()

    soup2 = BeautifulSoup(r2.text, "html.parser")

    departments = []
    seen = set()
    for a in soup2.find_all("a", href=True):
        href = a["href"]
        if "sch.asp" in href and "kisaadi=" in href:
            m = re.search(r"kisaadi=([^&]+)", href)
            if m:
                kisaadi = m.group(1)
                if kisaadi not in seen:
                    seen.add(kisaadi)
                    url = BASE_URL + href if href.startswith("/") else href
                    departments.append({
                        "name": a.get_text(strip=True),
                        "kisaadi": kisaadi,
                        "url": url,
                    })

    print(f"  {len(departments)} benzersiz bolum bulundu.")
    return departments


def format_code(code_str):
    """
    'CMPE101.01' -> 'CMPE101.01' (4 haneli dept + no space)
    Mevcut JSON formatina gore: 'CMPE 101.01' (dept + space + number)
    """
    code_clean = re.sub(r"\s+", "", code_str)
    m = re.match(r"^([A-Za-z]+)(\d.*)$", code_clean)
    if m:
        dept = m.group(1)
        num = m.group(2)
        # Mevcut JSON'da format: "CMPE101.01" (bosluksuz) gibi gorununce
        # Ama gercekte "CMPE 101.01" seklinde -- biz boyle saklayalim
        padded = dept.ljust(4)
        return f"{padded}{num}"
    return code_clean


def parse_schedule_table(html):
    """Ders programi HTML'inden ders verilerini parse et."""
    soup = BeautifulSoup(html, "html.parser")

    schedule_table = None
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        if len(rows) > 3:
            first = " ".join(
                c.get_text(strip=True) for c in rows[0].find_all(["td", "th"])
            ).lower()
            if "code" in first or "name" in first:
                schedule_table = table
                break

    if not schedule_table:
        return {}

    rows = schedule_table.find_all("tr")
    if not rows:
        return {}

    header_cells = rows[0].find_all(["td", "th"])
    header = [c.get_text(strip=True).lower() for c in header_cells]

    def col(name):
        for i, h in enumerate(header):
            if name in h:
                return i
        return -1

    idx_code  = col("code")
    idx_name  = col("name")
    idx_cr    = col("cr.")
    idx_ects  = col("ects")
    idx_instr = col("instr")
    idx_days  = col("days")
    idx_hours = col("hours")
    idx_rooms = col("rooms")

    courses = {}
    current_code = None
    current_instr = None
    lab_counters = {}
    ps_counters = {}

    for row in rows[1:]:
        cells = row.find_all(["td", "th"])
        if not cells:
            continue

        def ct(i):
            if i < 0 or i >= len(cells):
                return ""
            return cells[i].get_text(strip=True)

        code_raw  = ct(idx_code)
        name_raw  = ct(idx_name)
        instr_raw = ct(idx_instr)
        days_raw  = ct(idx_days)
        hours_raw = ct(idx_hours)
        rooms_raw = ct(idx_rooms)
        cr_raw    = ct(idx_cr)
        ects_raw  = ct(idx_ects)

        if not code_raw and not name_raw:
            continue

        if code_raw:
            current_code = re.sub(r"\s+", "", code_raw)
            if instr_raw:
                current_instr = instr_raw

        if not current_code:
            continue

        # Alt bolum tipi
        name_up = name_raw.upper()
        if not code_raw and name_raw:
            if "LAB" in name_up:
                lab_counters.setdefault(current_code, 0)
                lab_counters[current_code] += 1
                n = lab_counters[current_code]
                key = f"{current_code} LAB {n}" if n > 1 else f"{current_code} LAB 1"
                suffix_name = "LAB"
            elif "P.S" in name_up or name_up in ("PS",):
                ps_counters.setdefault(current_code, 0)
                ps_counters[current_code] += 1
                n = ps_counters[current_code]
                key = f"{current_code} P.S. {n}" if n > 1 else f"{current_code} P.S. 1"
                suffix_name = "P.S."
            else:
                # Diger alt satirlar - atla
                continue
        else:
            key = current_code
            suffix_name = None

        days_list  = parse_days(days_raw)  if days_raw  else []
        hours_list = parse_hours(hours_raw) if hours_raw else []
        rooms_list = [r.strip() for r in rooms_raw.split("|") if r.strip()] if rooms_raw else []

        # Rooms sayisini days sayisiyla esle
        if days_list and rooms_list:
            if len(rooms_list) == 1:
                rooms_list = rooms_list * len(days_list)
            elif len(rooms_list) < len(days_list):
                last = rooms_list[-1]
                while len(rooms_list) < len(days_list):
                    rooms_list.append(last)

        entry = {}

        # Code field (formatted)
        entry["code"] = format_code(current_code)

        # Instructor
        eff_instr = instr_raw if instr_raw else (current_instr or "")
        if eff_instr:
            entry["instructor"] = eff_instr

        # Name
        if name_raw:
            if suffix_name and name_raw.upper() == "LAB":
                entry["name"] = f"{_get_parent_name(courses, current_code)} LAB"
            elif suffix_name and ("P.S" in name_raw.upper()):
                entry["name"] = f"{_get_parent_name(courses, current_code)} P.S."
            else:
                entry["name"] = name_raw

        # Credits
        if cr_raw:
            try:
                entry["credits"] = int(cr_raw)
            except ValueError:
                pass

        # ECTS
        if ects_raw:
            try:
                entry["ects"] = float(ects_raw)
            except ValueError:
                pass

        if days_list:
            entry["days"] = days_list
        if hours_list:
            entry["hours"] = hours_list
        if rooms_list:
            entry["rooms"] = rooms_list

        courses[key] = entry

    return courses


def _get_parent_name(courses, code):
    """Parent ders adini bul."""
    if code in courses:
        return courses[code].get("name", code)
    return code


def scrape_department(session, dept, semester):
    try:
        r = session.get(dept["url"], timeout=30)
        r.raise_for_status()
        r.encoding = "iso-8859-9"
        return parse_schedule_table(r.text)
    except Exception as e:
        print(f"  HATA ({dept['kisaadi']}): {e}")
        return {}


def semester_to_filename(semester):
    """'2026/2027-1' -> '2026-2027-1'"""
    return semester.replace("/", "-")


def load_semesters_json():
    path = os.path.join(DATA_DIR, "semesters.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_semesters_json(lst):
    path = os.path.join(DATA_DIR, "semesters.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(lst, f, ensure_ascii=False, indent=4)
    print(f"semesters.json guncellendi: {path}")


def main():
    session = get_session()

    if len(sys.argv) > 1:
        target = sys.argv[1]
        print(f"Hedef donem (argumandan): {target}")
    else:
        available = get_available_semesters(session)
        if not available:
            print("HATA: Donem listesi alinamadi!")
            sys.exit(1)
        target = available[0]
        print(f"En son donem otomatik secildi: {target}")
        print(f"Mevcut donemler (ilk 5): {available[:5]}")

    filename = semester_to_filename(target) + ".json"
    output_path = os.path.join(DATA_DIR, filename)

    print(f"\nDonem: {target}")
    print(f"Cikti dosyasi: {output_path}")

    departments = get_departments(session, target)
    if not departments:
        print("HATA: Hic bolum bulunamadi!")
        sys.exit(1)

    all_courses = {}
    total = len(departments)
    print(f"\n{total} bolum icin dersler cekiliyor...\n")

    for i, dept in enumerate(departments, 1):
        print(f"[{i}/{total}] {dept['kisaadi']}: {dept['name']}", end="", flush=True)
        courses = scrape_department(session, dept, target)
        print(f" -> {len(courses)} ders")
        all_courses.update(courses)
        if i < total:
            time.sleep(0.4)

    print(f"\nToplam {len(all_courses)} ders kaydi toplandı.")

    sorted_courses = dict(sorted(all_courses.items()))
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(sorted_courses, f, ensure_ascii=False, separators=(",", ": "))

    size = os.path.getsize(output_path)
    print(f"Kayit edildi: {output_path} ({size:,} bytes)")

    current_semesters = load_semesters_json()
    if target not in current_semesters:
        current_semesters.insert(0, target)
        save_semesters_json(current_semesters)
        print(f"'{target}' semesters.json'a eklendi.")
    else:
        print(f"'{target}' zaten semesters.json'da mevcut.")

    print("\nTamamlandi!")


if __name__ == "__main__":
    main()
