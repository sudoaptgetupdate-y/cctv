import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        refresh: "Refresh",
        search: "Search",
        view: "View",
        no_data: "No data found",
        previous: "Previous",
        next: "Next",
        page_n: "Page {{num}}",
        saving: "Saving data...",
        close: "Close",
        confirm: "Confirm",
        error: "Error",
        success: "Success",
        items_per_page: "Items per page",
        showing: "Showing",
        to: "to",
        from: "from",
        records: "records",
        sign_out: "Sign Out"
      },
      sidebar: {
        dashboard: "Dashboard",
        cameras: "Cameras",
        groups: "Camera Groups",
        logs: "Audit Logs",
        settings: "Settings",
        main: "Main",
        monitoring: "Monitoring",
        system: "System Administration",
        my_profile: "My Profile"
      },
      cameras: {
        title: "Camera Management",
        subtitle: "MANAGE AND MONITOR ALL CCTV SYSTEMS",
        add_new: "Add New Camera",
        status: "Status",
        details: "Camera Details",
        location: "Location",
        health: "Health & Connection",
        actions: "Actions",
        last_seen: "Last Seen",
        ack: "Acknowledge",
        history: "Event History",
        preview: "Live Preview",
        online: "Online",
        offline: "Offline",
        error: "Critical Error",
        acknowledged: "Acknowledged"
      },
      groups: {
        title: "Group Management",
        subtitle: "MANAGE ZONES AND TELEGRAM NOTIFICATIONS",
        add_new: "Add New Group",
        name: "Group Name",
        description: "Description",
        members: "Cameras Count",
        notifications: "Telegram Bot Status",
        actions: "Actions",
        details: "Group Details",
        telegram_status: "Telegram Config"
      }
    }
  },
  th: {
    translation: {
      common: {
        loading: "กำลังโหลด...",
        save: "บันทึก",
        cancel: "ยกเลิก",
        delete: "ลบ",
        edit: "แก้ไข",
        refresh: "รีเฟรช",
        search: "ค้นหา",
        view: "ดู",
        no_data: "ไม่พบข้อมูล",
        previous: "ก่อนหน้า",
        next: "ถัดไป",
        page_n: "หน้า {{num}}",
        saving: "กำลังบันทึก...",
        close: "ปิด",
        confirm: "ยืนยัน",
        error: "ข้อผิดพลาด",
        success: "สำเร็จ",
        items_per_page: "แสดงหน้าละ",
        showing: "แสดงรายการที่",
        to: "ถึง",
        from: "จากทั้งหมด",
        records: "รายการ",
        sign_out: "ลงชื่อออก"
      },
      sidebar: {
        dashboard: "แดชบอร์ด",
        cameras: "จัดการกล้อง",
        groups: "กลุ่มกล้อง",
        logs: "ประวัติการใช้งาน",
        settings: "ตั้งค่าระบบ",
        main: "หน้าหลัก",
        monitoring: "การตรวจสอบ",
        system: "การจัดการระบบ",
        my_profile: "โปรไฟล์ของฉัน"
      },
      cameras: {
        title: "ระบบจัดการกล้อง",
        subtitle: "จัดการข้อมูลและตรวจสอบสถานะกล้องวงจรปิดทั้งหมด",
        add_new: "เพิ่มกล้องใหม่",
        status: "สถานะ",
        details: "รายละเอียดกล้อง",
        location: "พิกัด / การเชื่อมต่อ",
        health: "สุขภาพ & การเชื่อมต่อ",
        actions: "จัดการ",
        last_seen: "เห็นล่าสุด",
        ack: "รับทราบเหตุการณ์",
        history: "ประวัติเหตุการณ์",
        preview: "ดูสตรีมสด",
        online: "ออนไลน์",
        offline: "ออฟไลน์",
        error: "มีปัญหา",
        acknowledged: "รับทราบแล้ว"
      },
      groups: {
        title: "ระบบจัดการกลุ่ม",
        subtitle: "จัดการพื้นที่และการแจ้งเตือนผ่าน Telegram",
        add_new: "สร้างกลุ่มใหม่",
        name: "ชื่อกลุ่ม",
        description: "รายละเอียด",
        members: "จำนวนกล้อง",
        notifications: "สถานะการแจ้งเตือน",
        actions: "จัดการ",
        details: "รายละเอียดกลุ่ม",
        telegram_status: "การตั้งค่า Telegram"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'th',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;