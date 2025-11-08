import { User } from '@prisma/client';

export class UserResource {
  static toResponse(user: User) {
    if (!user) return null;

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      phone: user.phoneNumber,
      avatar: user.profileImage,
      email_verified_at: user.emailVerifiedAt?.toISOString() ?? null,
      status: user.status.charAt(0).toUpperCase() + user.status.slice(1),
      role: user.role,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),

      user_type: user.userType,
      company_name: user.companyName ?? '',
      company_address: user.companyAddress ?? '',
      company_phone: user.companyPhone ?? '',
      manager_name: user.managerName ?? '',
      company_legal_form: user.legalForm ?? '',
      legal_form_document: user.legalFormDocument ?? '',
      legal_form_document_url: user.legalFormDocument
        ? `${process.env.APP_URL}/${user.legalFormDocument}`
        : null,
      business_description: user.businessDescription ?? '',
    };
  }

  static collection(users: User[]) {
    return users.map((u) => this.toResponse(u));
  }
}
