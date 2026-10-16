// 测试数据 - 用于后端 API 返回给前端
const TEST_DATA = {
  colleges: [
    { id: "col-cs", code: "CS", name: "计算机学院" },
    { id: "col-sem", code: "SEM", name: "经济管理学院" },
    { id: "col-fl", code: "FL", name: "外国语学院" },
  ],
  majors: [
    { id: "maj-se", collegeId: "col-cs", code: "080902", name: "软件工程" },
    { id: "maj-cs", collegeId: "col-cs", code: "080901", name: "计算机科学与技术" },
    { id: "maj-ba", collegeId: "col-sem", code: "120201", name: "工商管理" },
    { id: "maj-en", collegeId: "col-fl", code: "050201", name: "英语" },
  ],
  classes: [
    { id: "cls-se24", majorId: "maj-se", name: "软工2401", year: 2024 },
    { id: "cls-cs24", majorId: "maj-cs", name: "计科2401", year: 2024 },
    { id: "cls-ba24", majorId: "maj-ba", name: "工管2401", year: 2024 },
    { id: "cls-en24", majorId: "maj-en", name: "英语2401", year: 2024 },
  ],
  students: [
    { id: "stu-1", studentNo: "2024010101", name: "林晓", gender: "女", enrollYear: 2024, collegeId: "col-cs", majorId: "maj-se", classId: "cls-se24", status: "在读" },
    { id: "stu-2", studentNo: "2024010102", name: "陈予安", gender: "男", enrollYear: 2024, collegeId: "col-cs", majorId: "maj-se", classId: "cls-se24", status: "在读" },
    { id: "stu-3", studentNo: "2024010103", name: "周晚川", gender: "男", enrollYear: 2024, collegeId: "col-cs", majorId: "maj-cs", classId: "cls-cs24", status: "在读" },
    { id: "stu-4", studentNo: "2024010104", name: "沈清禾", gender: "女", enrollYear: 2024, collegeId: "col-cs", majorId: "maj-cs", classId: "cls-cs24", status: "在读" },
    { id: "stu-5", studentNo: "2024020201", name: "许知夏", gender: "女", enrollYear: 2024, collegeId: "col-sem", majorId: "maj-ba", classId: "cls-ba24", status: "在读" },
    { id: "stu-6", studentNo: "2024020202", name: "韩见山", gender: "男", enrollYear: 2024, collegeId: "col-sem", majorId: "maj-ba", classId: "cls-ba24", status: "休学" },
    { id: "stu-7", studentNo: "2024030301", name: "顾南风", gender: "男", enrollYear: 2024, collegeId: "col-fl", majorId: "maj-en", classId: "cls-en24", status: "在读" },
    { id: "stu-8", studentNo: "2024010105", name: "苏晚宁", gender: "女", enrollYear: 2024, collegeId: "col-cs", majorId: "maj-se", classId: "cls-se24", status: "在读" },
  ],
  teachers: [
    { id: "tea-1", staffNo: "T10001", name: "张明远", collegeId: "col-cs", title: "副教授" },
    { id: "tea-2", staffNo: "T10002", name: "梁知秋", collegeId: "col-cs", title: "讲师" },
    { id: "tea-3", staffNo: "T20001", name: "何清越", collegeId: "col-sem", title: "教授" },
    { id: "tea-4", staffNo: "T30001", name: "叶思宁", collegeId: "col-fl", title: "副教授" },
  ],
  courses: [
    { id: "crs-ds", code: "CS2101", name: "数据结构", credits: 4, hours: 64, collegeId: "col-cs" },
    { id: "crs-os", code: "CS3102", name: "操作系统", credits: 3.5, hours: 56, collegeId: "col-cs" },
    { id: "crs-db", code: "CS2203", name: "数据库系统", credits: 3, hours: 48, collegeId: "col-cs" },
    { id: "crs-mgmt", code: "BA1101", name: "管理学原理", credits: 3, hours: 48, collegeId: "col-sem" },
    { id: "crs-eng", code: "FL1001", name: "学术英语写作", credits: 2, hours: 32, collegeId: "col-fl" },
    { id: "crs-disc", code: "CS1108", name: "离散数学", credits: 3, hours: 48, collegeId: "col-cs" },
  ],
  terms: [
    {
      id: "term-2026-1",
      name: "2026-2027 学年第一学期",
      enrollStart: "2026-09-01T00:00:00.000Z",
      enrollEnd: "2026-12-31T23:59:59.000Z",
      isCurrent: true,
    },
  ],
  offerings: [
    { id: "off-1", courseId: "crs-ds", termId: "term-2026-1", teacherId: "tea-1", section: "A班", capacity: 40, weekday: 1, startPeriod: 1, endPeriod: 2, location: "逸夫楼 301" },
    { id: "off-2", courseId: "crs-os", termId: "term-2026-1", teacherId: "tea-1", section: "A班", capacity: 35, weekday: 3, startPeriod: 3, endPeriod: 4, location: "逸夫楼 405" },
    { id: "off-3", courseId: "crs-db", termId: "term-2026-1", teacherId: "tea-2", section: "A班", capacity: 40, weekday: 2, startPeriod: 5, endPeriod: 6, location: "计算中心 201" },
    { id: "off-4", courseId: "crs-disc", termId: "term-2026-1", teacherId: "tea-2", section: "B班", capacity: 2, weekday: 4, startPeriod: 1, endPeriod: 2, location: "理学楼 108" },
    { id: "off-5", courseId: "crs-mgmt", termId: "term-2026-1", teacherId: "tea-3", section: "A班", capacity: 50, weekday: 2, startPeriod: 1, endPeriod: 2, location: "经管楼 210" },
    { id: "off-6", courseId: "crs-eng", termId: "term-2026-1", teacherId: "tea-4", section: "A班", capacity: 30, weekday: 5, startPeriod: 3, endPeriod: 4, location: "外语楼 102" },
    { id: "off-7", courseId: "crs-ds", termId: "term-2026-1", teacherId: "tea-2", section: "B班", capacity: 40, weekday: 1, startPeriod: 3, endPeriod: 4, location: "逸夫楼 302" },
  ],
  enrollments: [
    { id: "enr-1", studentId: "stu-1", offeringId: "off-1", createdAt: "2026-09-10T08:00:00.000Z", source: "self" },
    { id: "enr-2", studentId: "stu-1", offeringId: "off-3", createdAt: "2026-09-10T08:02:00.000Z", source: "self" },
    { id: "enr-3", studentId: "stu-2", offeringId: "off-1", createdAt: "2026-09-10T08:05:00.000Z", source: "self" },
    { id: "enr-4", studentId: "stu-3", offeringId: "off-4", createdAt: "2026-09-11T09:00:00.000Z", source: "admin" },
    { id: "enr-5", studentId: "stu-4", offeringId: "off-4", createdAt: "2026-09-11T09:01:00.000Z", source: "self" },
  ],
  users: [
    { id: "usr-admin", username: "admin", password: "123456", role: "admin", displayName: "教务处" },
    { id: "usr-t1", username: "T10001", password: "123456", role: "teacher", displayName: "张明远", refId: "tea-1" },
    { id: "usr-s1", username: "2024010101", password: "123456", role: "student", displayName: "林晓", refId: "stu-1" },
    { id: "usr-s2", username: "2024010102", password: "123456", role: "student", displayName: "陈予安", refId: "stu-2" },
  ],
  logs: [
    {
      id: "log-1",
      at: "2026-09-11T09:00:00.000Z",
      actor: "教务处",
      action: "强制加选",
      detail: "将 周晚川 加入 离散数学 B班",
    },
  ],
};

if (typeof module !== "undefined") {
  module.exports = TEST_DATA;
}
