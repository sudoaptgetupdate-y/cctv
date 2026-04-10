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
        sign_out: "Sign Out",
        create: "Create",
        save_changes: "Save Changes",
        restore: "Restore"
      },
      sidebar: {
        dashboard: "Dashboard",
        cameras: "Cameras",
        groups: "Camera Groups",
        users: "Users",
        logs: "Audit Logs",
        settings: "Settings",
        main: "Main",
        monitoring: "Monitoring",
        system: "System Administration",
        my_profile: "My Profile"
      },
      users: {
        title: "User Management",
        subtitle: "MANAGE SYSTEM OPERATORS AND PERMISSIONS",
        add_button: "Add User",
        tab_active: "Active Users",
        tab_inactive: "Inactive Users",
        search_placeholder: "Search by name, email, or username...",
        found_total: "Found {{count}} users",
        no_users_found: "No users found",
        no_users_description: "Your search didn't match any users in this category.",
        add_title: "Add New User",
        edit_title: "Edit User Details",
        roles: {
          SUPER_ADMIN: "Super Admin",
          ADMIN: "Admin",
          EMPLOYEE: "Employee",
          GUEST: "Guest"
        },
        status: {
          active: "Active",
          inactive: "Inactive"
        },
        table: {
          user: "User",
          role: "Role",
          created_at: "Created At",
          status: "Status"
        },
        form: {
          first_name: "First Name",
          first_name_placeholder: "John",
          last_name: "Last Name",
          last_name_placeholder: "Doe",
          email: "Email Address",
          username: "Username",
          role: "Access Role",
          status: "Account Status",
          password_title: "Account Password",
          change_password_title: "Change Password",
          password_optional: "Leave blank to keep current",
          password: "Password",
          confirm_password: "Confirm Password",
          password_strength: "Password Strength",
          rules: {
            length: "At least 8 characters",
            upper: "Uppercase letter (A-Z)",
            lower: "Lowercase letter (a-z)",
            number: "Number (0-9)",
            special: "Special character (@$!%*?&)"
          }
        },
        strength: {
          weak: "Weak",
          medium: "Medium",
          strong: "Strong"
        },
        messages: {
          fetch_error: "Failed to fetch users",
          updating: "Updating user...",
          saving: "Saving user...",
          deleting: "Deleting user...",
          password_mismatch: "Passwords do not match",
          password_invalid: "Password does not meet security requirements"
        },
        actions: {
          create_success: "User created successfully",
          update_success: "User updated successfully"
        },
        delete_confirm: {
          title: "Are you sure?",
          text: "Do you want to delete user {{name}}? This action may deactivate the user if they have related data.",
          confirm: "Yes, delete",
          success: "Action completed successfully",
          error: "Failed to perform action"
        }
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
        sign_out: "ลงชื่อออก",
        create: "สร้าง",
        save_changes: "บันทึกการแก้ไข",
        restore: "คืนค่า"
      },
      sidebar: {
        dashboard: "แดชบอร์ด",
        cameras: "จัดการกล้อง",
        groups: "กลุ่มกล้อง",
        users: "จัดการผู้ใช้งาน",
        logs: "ประวัติการใช้งาน",
        settings: "ตั้งค่าระบบ",
        main: "หน้าหลัก",
        monitoring: "การตรวจสอบ",
        system: "การจัดการระบบ",
        my_profile: "โปรไฟล์ของฉัน"
      },
      users: {
        title: "ระบบจัดการผู้ใช้งาน",
        subtitle: "จัดการข้อมูลผู้ดูแลระบบและกำหนดสิทธิ์การเข้าถึง",
        add_button: "เพิ่มผู้ใช้งาน",
        tab_active: "ผู้ใช้งานที่เปิดอยู่",
        tab_inactive: "ผู้ใช้งานที่ปิดอยู่",
        search_placeholder: "ค้นหาด้วยชื่อ, อีเมล หรือชื่อผู้ใช้...",
        found_total: "พบผู้ใช้งาน {{count}} ราย",
        no_users_found: "ไม่พบข้อมูลผู้ใช้งาน",
        no_users_description: "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหาของคุณในหมวดหมู่นี้",
        add_title: "เพิ่มผู้ใช้งานใหม่",
        edit_title: "แก้ไขข้อมูลผู้ใช้งาน",
        roles: {
          SUPER_ADMIN: "ผู้ดูแลระบบสูงสุด",
          ADMIN: "ผู้ดูแลระบบ",
          EMPLOYEE: "เจ้าหน้าที่",
          GUEST: "ผู้ใช้ทั่วไป"
        },
        status: {
          active: "ใช้งานอยู่",
          inactive: "ปิดการใช้งาน"
        },
        table: {
          user: "ผู้ใช้งาน",
          role: "ตำแหน่ง/สิทธิ์",
          created_at: "วันที่ลงทะเบียน",
          status: "สถานะ"
        },
        form: {
          first_name: "ชื่อจริง",
          first_name_placeholder: "สมชาย",
          last_name: "นามสกุล",
          last_name_placeholder: "ใจดี",
          email: "อีเมล",
          username: "ชื่อผู้ใช้ (Username)",
          role: "ระดับสิทธิ์",
          status: "สถานะบัญชี",
          password_title: "รหัสผ่านบัญชี",
          change_password_title: "เปลี่ยนรหัสผ่าน",
          password_optional: "เว้นว่างไว้หากไม่ต้องการเปลี่ยน",
          password: "รหัสผ่าน",
          confirm_password: "ยืนยันรหัสผ่าน",
          password_strength: "ความแข็งแรงของรหัสผ่าน",
          rules: {
            length: "อย่างน้อย 8 ตัวอักษร",
            upper: "อักษรพิมพ์ใหญ่ (A-Z)",
            lower: "อักษรพิมพ์เล็ก (a-z)",
            number: "ตัวเลข (0-9)",
            special: "อักขระพิเศษ (@$!%*?&)"
          }
        },
        strength: {
          weak: "อ่อนแอ",
          medium: "ปานกลาง",
          strong: "แข็งแรง"
        },
        messages: {
          fetch_error: "ไม่สามารถดึงข้อมูลผู้ใช้งานได้",
          updating: "กำลังอัปเดตข้อมูล...",
          saving: "กำลังบันทึกข้อมูล...",
          deleting: "กำลังลบข้อมูล...",
          password_mismatch: "รหัสผ่านไม่ตรงกัน",
          password_invalid: "รหัสผ่านไม่ตรงตามข้อกำหนดความปลอดภัย"
        },
        actions: {
          create_success: "สร้างผู้ใช้งานสำเร็จ",
          update_success: "อัปเดตข้อมูลสำเร็จ"
        },
        delete_confirm: {
          title: "คุณแน่ใจหรือไม่?",
          text: "ต้องการลบผู้ใช้งาน {{name}} ใช่หรือไม่? ระบบอาจใช้วิธีปิดการใช้งานแทนหากผู้ใช้งานมีข้อมูลผูกพัน",
          confirm: "ใช่, ลบเลย",
          success: "ดำเนินการสำเร็จ",
          error: "ดำเนินการไม่สำเร็จ"
        }
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