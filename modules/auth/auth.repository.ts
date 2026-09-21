import { prisma } from "@/lib/db/prisma";

interface CreateRefreshTokenData {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
}

export const authRepository = {
  createRefreshToken(
    data: CreateRefreshTokenData,
  ) {
    return prisma.refreshToken.create({
      data,
    });
  },

  findRefreshTokenByHash(
    tokenHash: string,
  ) {
    return prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },

      include: {
        user: true,
      },
    });
  },

  async rotateRefreshToken(
    currentTokenId: number,
    nextToken:
      CreateRefreshTokenData,
  ) {
    return prisma.$transaction(
      async (tx) => {
        const now = new Date();

        const revoked =
          await tx.refreshToken.updateMany({
            where: {
              id: currentTokenId,
              revokedAt: null,
              expiresAt: {
                gt: now,
              },
            },

            data: {
              revokedAt: now,
            },
          });

        if (revoked.count !== 1) {
          return false;
        }

        await tx.refreshToken.create({
          data: nextToken,
        });

        return true;
      },
    );
  },

  async revokeRefreshTokenByHash(
    tokenHash: string,
  ) {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },

      data: {
        revokedAt: new Date(),
      },
    });
  },
};