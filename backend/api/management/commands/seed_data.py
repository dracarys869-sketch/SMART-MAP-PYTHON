import os
from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from api.models import Location, Program

LOCATIONS = [("College of CCSICT",16.9379686,121.7639893,"college"),("College of Agriculture",16.9401390,121.7647525,"college"),("College of Law",16.9373171,121.7637492,"college"),("College of Business and Management",16.9360109,121.7645025,"college"),("College of Education",16.9365611,121.7646828,"college"),("College of Criminal and Justice Education",16.9393644,121.7652884,"college"),("College of Polytechnic",16.9387236,121.7642303,"college"),("Gate",16.9358273,121.7640069,"gate"),("Library",16.9369665,121.7637022,"landmark"),("Food Court",16.9380052,121.7649993,"landmark"),("Cashier",16.9364721,121.7643378,"landmark"),("CBAO",16.9358188,121.7642777,"landmark"),("CBM (U BUILDING)",16.9371557,121.7648479,"landmark")]
PROGRAMS = [
("bs-information-technology","BS in Information Technology","College of CCSICT","College of CCSICT","images/ict.png","Develop expertise in software development, networking, systems administration, and cybersecurity for modern digital environments.",["Software Developer or Web Developer","Network and Systems Administrator","IT Support, QA, or Cybersecurity Analyst"]),
("bs-agriculture","BS in Agriculture","College of Agriculture","College of Agriculture","images/agri.jpg","Develop practical and scientific skills in crop production, soil management, agribusiness, and sustainable farming systems for modern agriculture.",["Agricultural Technician or Extension Worker","Farm Operations and Agribusiness Management","Research and Development in Crop Science"]),
("ba-political-science","BA in Political Science","College of Law","College of Law","images/polsci.png","Examine governance, public policy, political behavior, and institutions to prepare for leadership, research, and public service careers.",["Policy and Legislative Research","Public Administration and Governance Roles","Community Development and Advocacy Work"]),
("bs-business-administration","BS in Business Administration","College of Business and Management","College of Business and Management","images/business-add.jpg","Learn core business areas including management, marketing, finance, and operations to lead teams and build sustainable organizations.",["Business Operations Analyst","Marketing and Sales Management Roles","Entrepreneurship and Startup Development"]),
("bs-secondary-education","BS in Secondary Education","College of Education","College of Education","images/secondary.jpg","Prepare to become an effective educator through pedagogy, classroom management, curriculum planning, and subject-area specialization.",["Junior and Senior High School Teaching","Curriculum and Learning Resource Development","Educational Program Coordination"]),
("bs-criminology","BS in Criminology","College of Criminal and Justice Education","College of Criminal and Justice Education","images/crim.jpg","Study criminal justice systems, forensic principles, law enforcement methods, and public safety strategies for community protection.",["Police Service and Public Safety Roles","Corrections and Community Rehabilitation","Forensic and Security-Related Services"]),
("bs-automotive","BS in Automotive","College of Polytechnic","College of Polytechnic","images/auto.png","Build strong technical competence in diagnostics, engine systems, electrical systems, and automotive servicing aligned with industry standards.",["Automotive Service Technician","Vehicle Diagnostics Specialist","Workshop Supervisor or Service Advisor"])]

class Command(BaseCommand):
    help = "Seed the original ISU Cauayan locations and program profiles safely."
    def handle(self, *args, **kwargs):
        # Clean up any legacy duplicate program entries
        Program.objects.filter(slug__contains="-in-").delete()
        location_by_name = {}
        for name, lat, lng, kind in LOCATIONS:
            location, _ = Location.objects.update_or_create(name=name, defaults={"latitude":lat,"longitude":lng,"type":kind})
            location_by_name[name] = location
        image_root = settings.BASE_DIR / "media" / "images-programs"
        for slug, name, college, location_name, image_filename, subtitle, outcomes in PROGRAMS:
            program, created = Program.objects.update_or_create(slug=slug, defaults={"name":name,"college":college,"location":location_by_name[location_name],"subtitle":subtitle,"description":subtitle,"learning_format":"On-campus","duration":"4 Years","program_type":"On-campus","career_outcomes":outcomes})
            source = image_root / os.path.basename(image_filename)
            if source.exists():
                with open(source, "rb") as image_file:
                    program.image.save(os.path.basename(image_filename), File(image_file), save=True)
        self.stdout.write(self.style.SUCCESS("Seeded 13 locations and 7 programs successfully."))
