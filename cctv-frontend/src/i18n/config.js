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
        restore: "Restore",
        add: "Add",
        remove: "Remove",
        export: "Export",
        apply: "Apply",
        days: "Days",
        custom: "Custom"
      },
      sidebar: {
        dashboard: "Dashboard",
        cameras: "Cameras",
        groups: "Camera Groups",
        users: "Users",
        logs: "Audit Logs",
        settings: "Settings",
        reports: "Reports",
        main: "Main",
        monitoring: "Monitoring",
        system: "System Administration",
        my_profile: "My Profile"
      },
      dashboard: {
        title: "CCTV Dashboard",
        greeting: {
          morning: "Good morning",
          afternoon: "Good afternoon",
          evening: "Good evening"
        },
        status: {
          optimal: "System Optimal",
          attention: "Needs Attention",
          last_updated: "Last Sync"
        },
        stats: {
          total_cameras: "Total Cameras",
          online: "Online",
          offline: "Offline"
        },
        map: {
          title: "CCTV Locations on Map",
          subtitle: "Shows all registered CCTV locations in the system",
          refresh: "Refresh Map",
          tooltip_hint: "Click to view live stream"
        }
      },
      reports: {
        title: "Visitor Analytics",
        subtitle: "Monitor traffic and camera usage statistics",
        all_cameras: "All Cameras",
        total_views: "Total Views",
        unique_visitors: "Unique Visitors",
        top_camera: "Most Active Camera",
        avg_daily: "Avg. Daily Views",
        traffic_trend: "Traffic Trend",
        top_n_cameras: "Top {{count}} Cameras",
        views_by_camera: "Views",
        fetch_error: "Failed to fetch report data",
        export_title: "Export Report",
        export_desc: "Choose your preferred file format",
        exporting: "Exporting report...",
        export_success: "Report exported successfully",
        export_error: "Failed to export report",
        uptime: "System Availability",
        uptime_excellent: "Excellent",
        uptime_check: "Check Logs",
        peak_time_analysis: "Hourly Traffic (Peak Time)",
        peak_time: "Hourly Views",
        top_rankings: "Camera Rankings",
        top_visitors: "Top 10 Visitors (By IP)",
        unique_ips: "Unique Devices",
        ip_address: "IP Address",
        last_activity: "Last Activity",
        total_visits: "Visits",
        platform_browser: "Platform / Browser",
        times: "times",
        no_data: "No visitor data found for this period",
        devices: "Device Types",
        browsers: "Browsers",
        os: "Operating Systems"
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
        edit_camera: "Edit Camera",
        search_placeholder: "Search camera name or RTSP URL...",
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
        pending: "Pending",
        error: "Critical Error",
        acknowledged: "Acknowledged",
        no_cameras_found: "No cameras found",
        filters: {
          all: "All",
          online: "Online",
          problem: "Error",
          offline: "Offline"
        },
        form: {
          basic_info: "Basic Information",
          camera_name: "Camera Name / Location",
          camera_name_placeholder: "e.g. Market Front - Zone 1",
          group_zone: "Group / Zone",
          select_group: "-- Select Group --",
          public_visibility: "Show in Public Dashboard (No login required)",
          location_map: "Location (Map)",
          streaming_config: "Streaming Config",
          main_rtsp: "Main RTSP URL",
          sub_rtsp: "Sub-stream URL (Optional)",
          sub_rtsp_placeholder: "For map display",
          playback_options: "Playback Options",
          preferred_stream: "Preferred Stream for Display",
          audio_support: "Audio Support",
          enable_audio: "Enable Audio",
          mute_audio: "Mute Audio",
          audio_hint: "* Camera must support and have audio enabled in device settings.",
          performance_mode: "Advanced Performance Mode",
          enable_transcoding: "Enable Transcoding",
          transcoding_hint: "Re-process video to force resolution/FPS (High CPU usage)",
          main_stream_config: "Main Stream (HD) Configuration",
          sub_stream_config: "Sub-stream (SD) Configuration",
          hd_resolution: "HD Resolution",
          hd_fps: "HD Frame Rate (FPS)",
          sd_resolution: "SD Resolution",
          sd_fps: "SD Frame Rate (FPS)",
          original: "-- Original --",
          no_groups_found: "No groups available"
        },
        messages: {
          fetch_error: "Failed to fetch cameras",
          save_success: "Camera added successfully",
          update_success: "Camera updated successfully",
          delete_success: "Camera deleted successfully",
          save_error: "Failed to save camera",
          delete_error: "Failed to delete camera",
          delete_confirm_title: "Are you sure?",
          delete_confirm_text: "You won't be able to revert this!",
          confirm_delete: "Yes, delete it!",
          history_fetch_error: "Failed to load event history",
          ack_success: "Event acknowledged successfully",
          ack_error: "Failed to save acknowledgment"
        }
      },
      groups: {
        title: "Group Management",
        subtitle: "MANAGE ZONES AND TELEGRAM NOTIFICATIONS",
        add_new: "Add New Group",
        edit_group: "Edit Group",
        search_placeholder: "Search group name or description...",
        name: "Group Name",
        description: "Description",
        members: "Cameras Count",
        notifications: "Telegram Bot Status",
        actions: "Actions",
        details: "Group Details",
        telegram_status: "Telegram Config",
        no_groups_found: "No groups found",
        no_description: "No description available",
        cameras_count: "{{count}} cameras",
        status: {
          active: "Active",
          config_required: "Config Required",
          disabled: "Disabled",
          ai_enabled: "AI Enabled",
          standard: "Standard"
        },
        form: {
          basic_info: "Basic Information",
          group_name: "Group Name / Zone",
          group_name_placeholder: "e.g. Zone A - Market",
          description_placeholder: "Additional details about this group...",
          telegram_section: "Telegram Notification",
          bot_token: "Telegram Bot Token",
          chat_id: "Telegram Chat ID",
          notify_hint: "System will send camera status alerts to this Telegram group.",
          ai_section: "AI Support Integration",
          ai_prompt: "AI System Prompt",
          ai_prompt_placeholder: "Instructions for AI to analyze events for this group..."
        },
        manage: {
          title: "Manage Group Members",
          desc: "Select cameras to include in this group. Changes are saved only when you click 'Save Changes'.",
          search_placeholder: "Search cameras by name or URL...",
          others_title: "Other Cameras",
          members_title: "Group Members",
          loading: "Loading cameras...",
          empty_available: "No other cameras found matching your search.",
          empty_assigned: "No cameras currently assigned to this group.",
          page: "Page {{current}} of {{total}}"
        },
        messages: {
          fetch_error: "Failed to fetch groups",
          save_success: "Group saved successfully",
          update_success: "Group updated successfully",
          delete_success: "Group deleted successfully",
          save_error: "Failed to save group",
          delete_error: "Failed to delete group",
          delete_confirm_title: "Are you sure?",
          delete_confirm_text: "Do you want to delete this group? (Cameras in this group won't be deleted)",
          confirm_delete: "Yes, delete",
          validating: "Validating...",
          saving: "Saving..."
        }
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
        restore: "คืนค่า",
        add: "เพิ่ม",
        remove: "เอาออก",
        export: "ส่งออก",
        apply: "ตกลง",
        days: "วัน",
        custom: "กำหนดเอง"
      },
      sidebar: {
        dashboard: "แดชบอร์ด",
        cameras: "จัดการกล้อง",
        groups: "กลุ่มกล้อง",
        users: "จัดการผู้ใช้งาน",
        logs: "ประวัติการใช้งาน",
        settings: "ตั้งค่าระบบ",
        reports: "สรุปรายงาน",
        main: "หน้าหลัก",
        monitoring: "การตรวจสอบ",
        system: "การจัดการระบบ",
        my_profile: "โปรไฟล์ของฉัน"
      },
      dashboard: {
        title: "แผงควบคุมระบบ",
        greeting: {
          morning: "อรุณสวัสดิ์",
          afternoon: "สวัสดีตอนบ่าย",
          evening: "สวัสดีตอนเย็น"
        },
        status: {
          optimal: "ระบบทำงานปกติ",
          attention: "ควรตรวจสอบระบบ",
          last_updated: "อัปเดตล่าสุด"
        },
        stats: {
          total_cameras: "กล้องทั้งหมด",
          online: "ออนไลน์",
          offline: "ออฟไลน์"
        },
        map: {
          title: "จุดติดตั้งกล้องบนแผนที่จริง",
          subtitle: "แสดงตำแหน่งกล้อง CCTV ทั้งหมดในระบบ",
          refresh: "รีเฟรชแผนที่",
          tooltip_hint: "คลิกเพื่อดูสตรีมสด"
        }
      },
      reports: {
        title: "สรุปสถิติผู้เข้าชม",
        subtitle: "ตรวจสอบปริมาณการเข้าชมและสถิติการใช้งานกล้อง",
        all_cameras: "กล้องทั้งหมด",
        total_views: "จำนวนการเข้าชมรวม",
        unique_visitors: "ผู้เข้าชม (ไม่ซ้ำ)",
        top_camera: "กล้องที่มีคนดูมากที่สุด",
        avg_daily: "เฉลี่ยการดูต่อวัน",
        traffic_trend: "แนวโน้มการเข้าชม",
        top_n_cameras: "กล้อง {{count}} อันดับแรก",
        views_by_camera: "จำนวนการเข้าชม",
        fetch_error: "ไม่สามารถดึงข้อมูลรายงานได้",
        export_title: "ส่งออกรายงาน",
        export_desc: "เลือกรูปแบบไฟล์ที่ต้องการ",
        exporting: "กำลังส่งออกรายงาน...",
        export_success: "ส่งออกรายงานสำเร็จ",
        export_error: "ส่งออกรายงานไม่สำเร็จ",
        uptime: "ความเสถียรของระบบ",
        uptime_excellent: "ยอดเยี่ยม",
        uptime_check: "ควรตรวจสอบ Log",
        peak_time_analysis: "สถิติรายชั่วโมง (ช่วงเวลา Peak)",
        peak_time: "จำนวนการเข้าชม",
        top_rankings: "อันดับการใช้งานกล้อง",
        top_visitors: "ผู้เข้าชม 10 อันดับแรก (แยกตาม IP)",
        unique_ips: "จำนวนอุปกรณ์",
        ip_address: "หมายเลข IP",
        last_activity: "กิจกรรมล่าสุดเมื่อ",
        total_visits: "จำนวนครั้งที่เข้าชม",
        platform_browser: "แพลตฟอร์ม / เบราว์เซอร์",
        times: "ครั้ง",
        no_data: "ไม่พบข้อมูลการเข้าชมในช่วงเวลานี้",
        devices: "ประเภทอุปกรณ์",
        browsers: "เบราว์เซอร์",
        os: "ระบบปฏิบัติการ"
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
        edit_camera: "แก้ไขข้อมูลกล้อง",
        search_placeholder: "ค้นหาชื่อกล้อง หรือ RTSP URL...",
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
        pending: "รอดำเนินการ",
        error: "มีปัญหา",
        acknowledged: "รับทราบแล้ว",
        no_cameras_found: "ไม่พบข้อมูลกล้อง",
        filters: {
          all: "ทั้งหมด",
          online: "ออนไลน์",
          problem: "มีปัญหา",
          offline: "ออฟไลน์"
        },
        form: {
          basic_info: "ข้อมูลพื้นฐาน",
          camera_name: "ชื่อกล้อง / จุดติดตั้ง",
          camera_name_placeholder: "เช่น หน้าตลาดหมู่ 1",
          group_zone: "กลุ่ม / พื้นที่ (Zones)",
          select_group: "-- เลือกกลุ่ม --",
          public_visibility: "แสดงผลในหน้า Public Dashboard (ไม่ต้อง Login)",
          location_map: "พิกัดแผนที่ (Location)",
          streaming_config: "การเชื่อมต่อสตรีม (Streaming)",
          main_rtsp: "Main RTSP URL",
          sub_rtsp: "Sub-stream URL (ถ้ามี)",
          sub_rtsp_placeholder: "สำหรับแสดงหน้าแผนที่",
          playback_options: "การตั้งค่าการเล่น (Playback)",
          preferred_stream: "สตรีมเริ่มต้นสำหรับแสดงผล",
          audio_support: "การจัดการเสียง (Audio)",
          enable_audio: "เปิดใช้งานเสียง",
          mute_audio: "ปิดเสียง",
          audio_hint: "* กล้องต้องรองรับและเปิดใช้ Audio ในตัวเครื่อง",
          performance_mode: "โหมดประสิทธิภาพขั้นสูง",
          enable_transcoding: "เปิดใช้งานการแปลงรหัส (Transcoding)",
          transcoding_hint: "ประมวลผลวิดีโอใหม่เพื่อบังคับความละเอียด/เฟรมเรต (กิน CPU สูง)",
          main_stream_config: "การตั้งค่า Main Stream (HD)",
          sub_stream_config: "การตั้งค่า Sub Stream (SD)",
          hd_resolution: "ความละเอียด HD",
          hd_fps: "เฟรมเรต HD (FPS)",
          sd_resolution: "ความละเอียด SD",
          sd_fps: "เฟรมเรต SD (FPS)",
          original: "-- ตามต้นฉบับ --",
          no_groups_found: "ไม่พบข้อมูลกลุ่ม"
        },
        messages: {
          fetch_error: "ไม่สามารถดึงข้อมูลกล้องได้",
          save_success: "เพิ่มกล้องใหม่สำเร็จ",
          update_success: "อัปเดตข้อมูลกล้องเรียบร้อย",
          delete_success: "ลบข้อมูลสำเร็จ",
          save_error: "บันทึกข้อมูลไม่สำเร็จ",
          delete_error: "ไม่สามารถลบข้อมูลได้",
          delete_confirm_title: "ยืนยันการลบ?",
          delete_confirm_text: "คุณจะไม่สามารถกู้คืนข้อมูลกล้องตัวนี้ได้!",
          confirm_delete: "ใช่, ลบเลย",
          history_fetch_error: "โหลดประวัติไม่สำเร็จ",
          ack_success: "รับทราบเหตุการณ์เรียบร้อย",
          ack_error: "บันทึกไม่สำเร็จ"
        },
        ack_modal: {
          title: "รับทราบเหตุการณ์",
          subtitle: "ยืนยันการรับทราบปัญหาของกล้องตัวนี้",
          selected_camera: "กล้องที่เลือก",
          reason_label: "เหตุผล / หมายเหตุ",
          reason_placeholder: "ระบุเหตุผลที่รับทราบ เช่น กำลังตรวจสอบ, ระบบล่ม, ฯลฯ",
          hint: "การรับทราบเหตุการณ์จะทำให้สถานะกล้องกลับมาเป็นปกติในระบบ และบันทึกประวัติผู้ที่เข้ามาดำเนินการ",
          confirm_btn: "ยืนยันรับทราบ"
        },
        history_modal: {
          title: "ประวัติเหตุการณ์",
          subtitle: "Camera Event Timeline",
          limit_hint: "แสดงประวัติย้อนหลังสูงสุด 50 รายการ",
          current_status: "สถานะปัจจุบัน",
          no_events: "ยังไม่มีบันทึกเหตุการณ์สำหรับกล้องตัวนี้",
          fetching: "กำลังดึงข้อมูลประวัติ...",
          recorded_by: "บันทึกโดยระบบ",
          system_ver: "HealthCheck V1"
        }
      },
      groups: {
        title: "ระบบจัดการกลุ่ม",
        subtitle: "จัดการพื้นที่และการแจ้งเตือนผ่าน Telegram",
        add_new: "สร้างกลุ่มใหม่",
        edit_group: "แก้ไขกลุ่มพื้นที่",
        search_placeholder: "ค้นหาชื่อกลุ่ม หรือ รายละเอียด...",
        name: "ชื่อกลุ่ม",
        description: "รายละเอียด",
        members: "จำนวนกล้อง",
        notifications: "สถานะการแจ้งเตือน",
        actions: "จัดการ",
        details: "รายละเอียดกลุ่ม",
        telegram_status: "การตั้งค่า Telegram",
        no_groups_found: "ไม่พบข้อมูลกลุ่มกล้อง",
        no_description: "ไม่มีรายละเอียด",
        cameras_count: "{{count}} กล้อง",
        status: {
          active: "ใช้งานอยู่",
          config_required: "ยังไม่ตั้งค่า",
          disabled: "ปิดใช้งาน",
          ai_enabled: "เปิดใช้ AI",
          standard: "ปกติ"
        },
        form: {
          basic_info: "ข้อมูลพื้นฐาน",
          group_name: "ชื่อกลุ่ม / พื้นที่",
          group_name_placeholder: "เช่น หมู่ 1 - โซนตลาด",
          description_placeholder: "รายละเอียดเพิ่มเติมเกี่ยวกับกลุ่มนี้...",
          telegram_section: "การแจ้งเตือน Telegram",
          bot_token: "Telegram Bot Token",
          chat_id: "Telegram Chat ID",
          notify_hint: "ระบบจะส่งแจ้งเตือนสถานะกล้องในกลุ่มนี้ไปยัง Telegram ทันทีที่พบปัญหา",
          ai_section: "การรวมระบบ AI Support",
          ai_prompt: "AI System Prompt",
          ai_prompt_placeholder: "ระบุคำสั่งให้ AI วิเคราะห์เหตุการณ์สำหรับกลุ่มนี้..."
        },
        manage: {
          title: "จัดการสมาชิกในกลุ่ม",
          desc: "เลือกกล้องที่ต้องการให้อยู่ในกลุ่มนี้ การแก้ไขจะมีผลเมื่อคุณกด 'บันทึกการแก้ไข' เท่านั้น",
          search_placeholder: "ค้นหากล้องด้วยชื่อ หรือ URL...",
          others_title: "กล้องตัวอื่น",
          members_title: "สมาชิกในกลุ่ม",
          loading: "กำลังโหลดข้อมูลกล้อง...",
          empty_available: "ไม่พบกล้องตัวอื่นที่ตรงกับการค้นหา",
          empty_assigned: "ยังไม่มีกล้องที่สังกัดกลุ่มนี้",
          page: "หน้า {{current}} จาก {{total}}"
        },
        messages: {
          fetch_error: "ไม่สามารถดึงข้อมูลกลุ่มได้",
          save_success: "เพิ่มกลุ่มใหม่สำเร็จ",
          update_success: "อัปเดตข้อมูลกลุ่มเรียบร้อย",
          delete_success: "ลบข้อมูลสำเร็จ",
          save_error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          delete_error: "ลบข้อมูลไม่สำเร็จ",
          delete_confirm_title: "ยืนยันการลบ?",
          delete_confirm_text: "คุณต้องการลบกลุ่มนี้ใช่หรือไม่? (กล้องในกลุ่มนี้จะไม่ถูกลบ)",
          confirm_delete: "ใช่, ลบเลย",
          validating: "กำลังตรวจสอบ...",
          saving: "กำลังบันทึก..."
        }
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
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
