import { User } from '../models/users.js'

export async function doesUserExist(membershipId) {
    return await User.findOne({ membership_id: membershipId }).lean().then((user, error) => {
        if (error) {
            return error
        } else if (user == null) {
            return false
        } else if (user) {
            return true
        } else {
            return false
        }
    })
}

export async function addUser(membershipId, refreshTokenInfo) {
    const user = new User({
        membership_id: membershipId,
        refresh_expiration: refreshTokenInfo.refresh_expiration,
        refresh_token: refreshTokenInfo.refresh_token
    })

    try {
        console.log('Saving new user record')
        await user.save()
    } catch (error) {
        console.log('Adding user failed')
        console.log(error)
    }
}

export async function updateUser(membershipId, refreshTokenInfo) {
    try {
        await User.findOneAndUpdate(
            { membership_id: membershipId },
            { $set: { refreshTokenInfo } },
            (error) => {
                if (error) {
                    console.log('Updating user record failed')
                    console.log(error)
                } else {
                    console.log('Updated user record')
                }
            }
        )
    } catch (error) {
        return error
    }
}
